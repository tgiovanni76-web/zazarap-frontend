import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, type, title, message, linkUrl, relatedId, sendEmail = false } = await req.json();

    if (!userId || !type || !title || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check user's notification preferences
    const prefs = await base44.asServiceRole.entities.NotificationPreference.filter({ userId });
    const userPrefs = prefs[0];

    // Check if this type of notification is enabled
    const notificationEnabled = {
      message: userPrefs?.messageReplies ?? true,
      purchase: userPrefs?.statusUpdates ?? true,
      shipping: userPrefs?.statusUpdates ?? true,
      price_drop: userPrefs?.newOfferOnFavorite ?? true,
      offer: userPrefs?.newOfferOnFavorite ?? true,
      status_update: userPrefs?.statusUpdates ?? true,
    };

    if (!notificationEnabled[type]) {
      return Response.json({ message: 'Notification disabled by user preferences' });
    }

    // Create in-app notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      userId,
      type,
      title,
      message,
      linkUrl,
      relatedId,
      read: false,
    });

    // Send email if enabled and user has email notifications on
    if (sendEmail && userPrefs?.emailNotifications) {
      const user = await base44.asServiceRole.entities.User.filter({ email: userId });
      if (user[0]) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: userId,
          subject: title,
          body: `${message}\n\n${linkUrl ? `Link: ${linkUrl}` : ''}`,
        });
      }
    }

    return Response.json({ success: true, notification });
  } catch (error) {
    console.error('sendNotification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});