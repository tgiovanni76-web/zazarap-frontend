import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import crypto from 'node:crypto';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verifica webhook signature
    const isValid = await verifyWebhookSignature(req);
    if (!isValid) {
      console.error('Invalid PayPal webhook signature');
      return Response.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = await req.json();
    const { event_type, resource } = body;

    console.log('PayPal webhook received:', event_type);

    // Gestisci eventi PayPal
    switch (event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(base44, resource);
        break;
      
      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleRefund(base44, resource);
        break;
      
      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(base44, resource);
        break;
      
      case 'CUSTOMER.DISPUTE.CREATED':
        await handleDisputeCreated(base44, resource);
        break;
    }

    return Response.json({ status: 'success' });
  } catch (error) {
    console.error('PayPal webhook error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function verifyWebhookSignature(req) {
  const WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID');
  if (!WEBHOOK_ID) return true; // Skip in dev

  const headers = {
    'transmission-id': req.headers.get('paypal-transmission-id'),
    'transmission-time': req.headers.get('paypal-transmission-time'),
    'transmission-sig': req.headers.get('paypal-transmission-sig'),
    'cert-url': req.headers.get('paypal-cert-url'),
    'auth-algo': req.headers.get('paypal-auth-algo')
  };

  const body = await req.text();
  
  // Verifica signature usando PayPal SDK o manual verification
  // Per ora return true, implementa verifica completa in produzione
  return true;
}

async function handlePaymentCompleted(base44, resource) {
  const transactionId = resource.id;
  const amount = parseFloat(resource.amount.value);

  // Trova payment record
  const payments = await base44.asServiceRole.entities.Payment.filter({
    paypalTransactionId: transactionId
  });

  if (payments.length > 0) {
    const payment = payments[0];
    
    // Aggiorna stato a escrow
    await base44.asServiceRole.entities.Payment.update(payment.id, {
      status: 'held_in_escrow',
      escrowReleaseDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    });

    // Notifica acquirente
    await base44.asServiceRole.entities.Notification.create({
      userId: payment.buyerId,
      type: 'status_update',
      title: 'Pagamento ricevuto',
      message: 'Il tuo pagamento è stato ricevuto e messo in escrow. Verrà rilasciato al venditore dopo 14 giorni o conferma di ricezione.',
      relatedId: payment.chatId
    });

    // Notifica venditore
    await base44.asServiceRole.entities.Notification.create({
      userId: payment.sellerId,
      type: 'status_update',
      title: 'Pagamento in escrow',
      message: 'Il pagamento dell\'acquirente è stato messo in escrow. Puoi procedere con la spedizione.',
      relatedId: payment.chatId
    });

    console.log(`Payment ${payment.id} moved to escrow`);
  }
}

async function handleRefund(base44, resource) {
  const transactionId = resource.id;

  const payments = await base44.asServiceRole.entities.Payment.filter({
    paypalTransactionId: transactionId
  });

  if (payments.length > 0) {
    const payment = payments[0];
    
    await base44.asServiceRole.entities.Payment.update(payment.id, {
      status: 'refunded'
    });

    // Notifica entrambi gli utenti
    await base44.asServiceRole.entities.Notification.create({
      userId: payment.buyerId,
      type: 'status_update',
      title: 'Rimborso completato',
      message: 'Il rimborso è stato completato con successo.',
      relatedId: payment.chatId
    });

    console.log(`Payment ${payment.id} refunded`);
  }
}

async function handleOrderApproved(base44, resource) {
  const orderId = resource.id;
  console.log(`Order ${orderId} approved by buyer`);
}

async function handleDisputeCreated(base44, resource) {
  const disputeId = resource.dispute_id;
  const transactionId = resource.disputed_transactions?.[0]?.seller_transaction_id;

  if (transactionId) {
    const payments = await base44.asServiceRole.entities.Payment.filter({
      paypalTransactionId: transactionId
    });

    if (payments.length > 0) {
      const payment = payments[0];
      
      // Crea dispute nel sistema
      await base44.asServiceRole.entities.Dispute.create({
        chatId: payment.chatId,
        reporterId: payment.buyerId,
        respondentId: payment.sellerId,
        type: 'payment_issue',
        description: `PayPal dispute created: ${disputeId}`,
        status: 'open'
      });

      // Notifica venditore
      await base44.asServiceRole.entities.Notification.create({
        userId: payment.sellerId,
        type: 'status_update',
        title: 'Disputa PayPal aperta',
        message: 'L\'acquirente ha aperto una disputa su PayPal. Rispondi il prima possibile.',
        relatedId: payment.chatId
      });

      console.log(`Dispute created for payment ${payment.id}`);
    }
  }
}