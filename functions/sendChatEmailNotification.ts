import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverEmail, type, listingTitle, chatId, amount, senderName } = await req.json();

    console.log('[EMAIL_NOTIFICATION] Request:', { receiverEmail, type, listingTitle, chatId, amount, senderName });

    // Rate limiting: Check if we already sent an email to this receiver in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentEmails = await base44.asServiceRole.entities.Notification.filter({
      userId: receiverEmail,
      type: type === 'offer' ? 'offer' : 'message',
      created_date: { $gte: fiveMinutesAgo }
    });

    console.log('[EMAIL_NOTIFICATION] Recent emails found:', recentEmails.length);

    if (recentEmails.length > 0) {
      console.log('[EMAIL_NOTIFICATION] Rate limit reached, skipping email');
      return Response.json({ 
        success: true, 
        message: 'Email skipped due to rate limit',
        sent: false 
      });
    }

    // Check if receiver has unread messages (email only if offline/unread)
    const chats = await base44.asServiceRole.entities.Chat.filter({ id: chatId });
    const chat = chats[0];
    
    if (!chat) {
      console.log('[EMAIL_NOTIFICATION] Chat not found');
      return Response.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Determine if receiver is seller or buyer
    const isSeller = chat.sellerId === receiverEmail;
    const unreadCount = isSeller ? (chat.unreadSeller || 0) : (chat.unreadBuyer || 0);

    console.log('[EMAIL_NOTIFICATION] Unread count for receiver:', unreadCount);

    // Only send email if there are unread messages
    if (unreadCount === 0) {
      console.log('[EMAIL_NOTIFICATION] No unread messages, skipping email');
      return Response.json({ 
        success: true, 
        message: 'Email skipped - no unread messages',
        sent: false 
      });
    }

    // Prepare email content
    let subject, body;
    const appUrl = 'https://zazarap.de';
    const chatUrl = `${appUrl}/Messages?chatId=${chatId}`;
    const displayName = senderName || user.email.split('@')[0];

    if (type === 'offer') {
      subject = `💰 Neues Angebot für "${listingTitle}"`;
      body = `
Hallo,

${displayName} hat ein neues Angebot von ${amount}€ für deinen Artikel "${listingTitle}" gemacht!

🔗 Angebot jetzt ansehen und darauf antworten:
${chatUrl}

Du kannst das Angebot annehmen, ablehnen oder ein Gegenangebot machen.

Viele Grüße,
Dein Zazarap-Team
      `;
    } else {
      subject = `💬 Neue Nachricht zu "${listingTitle}"`;
      body = `
Hallo,

${displayName} hat dir eine neue Nachricht zu deinem Artikel "${listingTitle}" geschickt!

🔗 Nachricht jetzt ansehen und antworten:
${chatUrl}

Viele Grüße,
Dein Zazarap-Team
      `;
    }

    console.log('[EMAIL_NOTIFICATION] Sending email to:', receiverEmail);

    // Send email using Core.SendEmail integration
    await base44.asServiceRole.integrations.Core.SendEmail({
      from_name: 'Zazarap Marketplace',
      to: receiverEmail,
      subject: subject,
      body: body
    });

    console.log('[EMAIL_NOTIFICATION] ✅ Email sent successfully');

    return Response.json({ 
      success: true, 
      message: 'Email sent successfully',
      sent: true 
    });

  } catch (error) {
    console.error('[EMAIL_NOTIFICATION] ❌ Error:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});