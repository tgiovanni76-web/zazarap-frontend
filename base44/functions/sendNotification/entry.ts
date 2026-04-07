import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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
      // Legacy types
      order_shipped: 'shippingNotifications',
      order_delivered: 'shippingNotifications',
      order_update: 'statusUpdates',
      price_drop: 'priceDropNotifications',
      purchase_complete: 'purchaseNotifications',
      new_offer: 'newOfferOnFavorite', // legacy naming
      message_received: 'messageReplies',
      // App types (entity Notification.type)
      offer: 'newOfferOnFavorite',
      message: 'messageReplies',
      status_update: 'statusUpdates'
    };

    // Respect user prefs for EMAIL ONLY; in-app notifications are always created
    const emailAllowed = !!(userPrefs.emailNotifications && (!prefMapping[type] || userPrefs[prefMapping[type]]));

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

    // Email sending disabled in preview/this build to avoid provider restrictions.
    // In-app notifications are created above and are sufficient for UX.
    // if (emailAllowed && type !== 'message') {
    //   try {
    //     await base44.integrations.Core.SendEmail({
    //       to: userId,
    //       subject: title,
    //       body: `${message}\n\n${actionUrl ? `Visualizza: ${actionUrl}` : ''}`
    //     });
    //   } catch (e) {
    //     console.log('Email send failed:', e);
    //   }
    // }

    return Response.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Send notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});