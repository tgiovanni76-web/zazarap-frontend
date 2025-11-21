import { base44 } from '@/api/base44Client';

export const createNotificationWithEmail = async ({ userId, type, title, message, linkUrl, relatedId, emailSubject, emailBody }) => {
  try {
    await base44.entities.Notification.create({
      userId,
      type,
      title,
      message,
      linkUrl,
      relatedId
    });

    if (emailSubject && emailBody) {
      await base44.integrations.Core.SendEmail({
        to: userId,
        subject: emailSubject,
        body: emailBody
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};