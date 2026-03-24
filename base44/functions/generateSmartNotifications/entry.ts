import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { userId, type, context } = await req.json();

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

    // Check if this notification type is enabled
    const notificationEnabled = {
      order_update: userPrefs.statusUpdates || userPrefs.shippingNotifications,
      new_offer: userPrefs.newOfferOnFavorite,
      product_suggestion: true, // Always allow AI suggestions
      cart_reminder: userPrefs.purchaseNotifications,
      security_alert: true, // Always send security alerts
      price_drop: userPrefs.priceDropNotifications
    };

    if (!notificationEnabled[type]) {
      return Response.json({ 
        success: false, 
        message: 'Notification type disabled by user' 
      });
    }

    // Generate AI-powered notification content
    let prompt = '';
    
    switch(type) {
      case 'order_update':
        prompt = `Genera una notifica per aggiornamento ordine.
Contesto: ${JSON.stringify(context)}
Scrivi un messaggio chiaro, personalizzato e utile che informi l'utente dello stato del suo ordine.`;
        break;
        
      case 'new_offer':
        prompt = `Un venditore seguito ha pubblicato un nuovo annuncio.
Contesto: ${JSON.stringify(context)}
Crea una notifica accattivante che invogli l'utente a visualizzare il prodotto.`;
        break;
        
      case 'product_suggestion':
        prompt = `Suggerisci un prodotto all'utente basandoti sui suoi interessi.
Contesto: ${JSON.stringify(context)}
Crea una notifica personalizzata che spieghi perché questo prodotto potrebbe interessargli.`;
        break;
        
      case 'cart_reminder':
        prompt = `Promemoria carrello abbandonato.
Contesto: ${JSON.stringify(context)}
Scrivi un messaggio persuasivo ma non invadente per ricordare all'utente di completare l'acquisto.`;
        break;
        
      case 'security_alert':
        prompt = `Avviso di sicurezza account.
Contesto: ${JSON.stringify(context)}
Scrivi un messaggio chiaro e rassicurante che spieghi il problema e le azioni da intraprendere.`;
        break;
        
      case 'price_drop':
        prompt = `Notifica riduzione prezzo su un prodotto nei preferiti.
Contesto: ${JSON.stringify(context)}
Crea una notifica entusiasta che comunichi l'opportunità di risparmio.`;
        break;
    }

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          message: { type: "string" },
          actionText: { type: "string" },
          urgency: { 
            type: "string",
            enum: ["low", "medium", "high"]
          }
        }
      }
    });

    // Create notification
    const notification = await base44.asServiceRole.entities.Notification.create({
      userId,
      type,
      title: aiResponse.title,
      message: aiResponse.message,
      actionUrl: context.actionUrl || '',
      read: false,
      priority: aiResponse.urgency
    });

    // Send email if enabled
    if (userPrefs.emailNotifications && aiResponse.urgency !== 'low') {
      try {
        await base44.integrations.Core.SendEmail({
          to: userId,
          subject: aiResponse.title,
          body: `${aiResponse.message}\n\n${context.actionUrl ? `Vai a: ${context.actionUrl}` : ''}`
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
    console.error('Smart notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});