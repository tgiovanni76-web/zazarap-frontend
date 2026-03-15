import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1) Create a demo listing owned by the current user (active + approved)
    const listing = await base44.entities.Listing.create({
      title: 'DEMO – Fiat Punto Evo 1.4 Multiair',
      description: 'Annuncio di prova per testare chat, offerte e pagamento.',
      price: 5000,
      listingType: 'negotiable',
      category: 'vehicles',
      city: 'Berlin',
      images: [
        'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?q=80&w=1200&auto=format&fit=crop'
      ],
      status: 'active',
      moderationStatus: 'approved'
    });

    // Helper to create an offer + message with link to OFFER_ID
    const createOfferWithMessage = async ({ chatId, senderId, receiverId, amount, status = 'pending', type = 'initial', message }) => {
      const offer = await base44.entities.Offer.create({
        chatId,
        listingId: listing.id,
        senderId,
        receiverId,
        amount,
        previousAmount: listing.price,
        status,
        type,
        message
      });

      const offerText = message
        ? `${type === 'counter' ? '🔄 Gegenangebot' : '💰 Angebot'}: ${amount}€\n"${message}"`
        : `${type === 'counter' ? '🔄 Gegenangebot' : '💰 Angebot'}: ${amount}€`;

      await base44.entities.ChatMessage.create({
        chatId,
        senderId,
        receiverId,
        text: offerText + `\n[OFFER_ID:${offer.id}]`,
        price: amount,
        messageType: 'offer',
        read: false
      });

      return offer;
    };

    // 2) Chat A: l'utente è il venditore, acquirente demo → vedrà i pulsanti Accetta/Contro/Annulla (se consentito dalle regole)
    const DEMO_BUYER = 'demo-buyer@zazarap.test';
    const chatA = await base44.entities.Chat.create({
      listingId: listing.id,
      buyerId: DEMO_BUYER,
      sellerId: user.email,
      lastMessage: 'Chat di prova avviata',
      lastPrice: 3000,
      status: 'in_attesa',
      updatedAt: new Date().toISOString(),
      listingTitle: listing.title,
      listingImage: listing.images?.[0]
    });

    await base44.entities.ChatMessage.create({
      chatId: chatA.id,
      senderId: DEMO_BUYER,
      receiverId: user.email,
      text: `💬 Chat avviata per \"${listing.title}\" – Prezzo: ${listing.price}€`,
      messageType: 'system',
      read: false
    });

    // Offerta pendente (da finto acquirente) → dovrebbe mostrare azioni al venditore
    const offerA1 = await createOfferWithMessage({
      chatId: chatA.id,
      senderId: DEMO_BUYER,
      receiverId: user.email,
      amount: 3000,
      status: 'pending',
      type: 'initial',
      message: 'Posso passare oggi pomeriggio.'
    });

    // Contro-offerta (già contrassegnata come countered)
    const offerA2 = await createOfferWithMessage({
      chatId: chatA.id,
      senderId: user.email,
      receiverId: DEMO_BUYER,
      amount: 4800,
      status: 'countered',
      type: 'counter',
      message: 'Ultimo prezzo, grazie.'
    });

    // 3) Chat B: l'utente è acquirente e la chat è già accettata → vedrà il pulsante Paga ora
    const DEMO_SELLER = 'demo-seller@zazarap.test';
    const chatB = await base44.entities.Chat.create({
      listingId: listing.id,
      buyerId: user.email,
      sellerId: DEMO_SELLER,
      lastMessage: '✅ Offerta accettata – Riservato',
      lastPrice: 4800,
      status: 'accettata',
      updatedAt: new Date().toISOString(),
      listingTitle: listing.title,
      listingImage: listing.images?.[0]
    });

    await base44.entities.ChatMessage.create({
      chatId: chatB.id,
      senderId: DEMO_SELLER,
      receiverId: user.email,
      text: `✅ Offerta di 4800€ accettata – Hai 48h per pagare` ,
      messageType: 'system',
      read: false
    });

    await createOfferWithMessage({
      chatId: chatB.id,
      senderId: DEMO_SELLER,
      receiverId: user.email,
      amount: 4800,
      status: 'accepted_reserved',
      type: 'counter'
    });

    return Response.json({
      ok: true,
      listingId: listing.id,
      chats: [chatA.id, chatB.id],
      offers: [offerA1.id, offerA2.id]
    });
  } catch (error) {
    return Response.json({ error: error.message || String(error) }, { status: 500 });
  }
});