import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user for security (prevents anonymous notification spam)
    const caller = await base44.auth.me().catch(() => null);
    if (!caller) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, type, title, message, actionUrl, metadata } = await req.json();

    // Basic payload validation
    if (!userId || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({
      userId
    });

    const userPrefs = prefs[0] || {
      emailNotifications: true,
      newOfferOnFavorite: true,
      messageReplies: true,
      statusUpdates: true,
      purchaseNotifications: true,
      shippingNotifications: true,
      priceDropNotifications: true
    };

    // Map notification types to preference keys
    const prefMapping = {
      order_shipped: 'shippingNotifications',
      order_delivered: 'shippingNotifications',
      order_update: 'statusUpdates',
      message_received: 'messageReplies',
      new_offer: 'newOfferOnFavorite',
      price_drop: 'priceDropNotifications',
      purchase_complete: 'purchaseNotifications'
    };

    // Check if notification type is enabled
    if (prefMapping[type] && !userPrefs[prefMapping[type]]) {
      return Response.json({ 
        success: false, 
        message: 'Notification disabled by user preferences' 
      });
    }

    // Create notification (service role bypasses RLS)
    const notification = await base44.asServiceRole.entities.Notification.create({
      userId,
      type,
      title,
      message,
      linkUrl: actionUrl || '',
      relatedId: metadata && metadata.chatId ? String(metadata.chatId) : undefined,
      read: false
    });

    // Send email if enabled or type is offer/status update
    if (userPrefs.emailNotifications && type !== 'message_received') {
      try {
        await base44.integrations.Core.SendEmail({
          to: userId,
          subject: title,
          body: `${message}\n\n${actionUrl ? `Visualizza: ${actionUrl}` : ''}`
        });
      } catch (e) {
        console.log('Email send failed:', e);
      }
    }

    return Response.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});