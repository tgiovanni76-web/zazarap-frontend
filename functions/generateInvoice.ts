import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.2';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId } = await req.json();

    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders || orders.length === 0) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    const order = orders[0];
    if (order.userId !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orderItems = await base44.asServiceRole.entities.OrderItem.filter({ orderId });

    const doc = new jsPDF();

    // Header
    doc.setFontSize(24);
    doc.setTextColor(214, 40, 40);
    doc.text('FATTURA', 105, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Zazarap Marketplace', 20, 40);
    doc.text('Via Example 123, 00100 Roma', 20, 45);
    doc.text('P.IVA: IT12345678901', 20, 50);

    // Order Info
    doc.setFontSize(12);
    doc.text(`Fattura N. ${order.orderNumber}`, 140, 40);
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(order.created_date).toLocaleDateString('it-IT')}`, 140, 45);
    doc.text(`Stato: ${order.status}`, 140, 50);

    // Billing Address
    doc.setFontSize(12);
    doc.text('Fatturato a:', 20, 65);
    doc.setFontSize(10);
    if (order.shippingAddress) {
      doc.text(order.shippingAddress.fullName || '', 20, 70);
      doc.text(order.shippingAddress.street || '', 20, 75);
      doc.text(`${order.shippingAddress.postalCode || ''} ${order.shippingAddress.city || ''}`, 20, 80);
    }

    // Items Table
    let y = 100;
    doc.setFontSize(10);
    doc.setFillColor(240, 240, 240);
    doc.rect(20, y - 5, 170, 8, 'F');
    doc.text('Articolo', 25, y);
    doc.text('Qtà', 120, y);
    doc.text('Prezzo', 140, y);
    doc.text('Totale', 165, y);

    y += 10;
    doc.setFontSize(9);

    for (const item of orderItems) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(item.listingTitle.substring(0, 40), 25, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`${item.price.toFixed(2)}€`, 140, y);
      doc.text(`${item.subtotal.toFixed(2)}€`, 165, y);
      y += 7;
    }

    // Summary
    y += 10;
    doc.setFontSize(10);
    doc.text('Subtotale:', 140, y);
    doc.text(`${order.subtotal?.toFixed(2) || '0.00'}€`, 175, y, { align: 'right' });

    if (order.discountAmount > 0) {
      y += 7;
      doc.setTextColor(0, 150, 0);
      doc.text('Sconto:', 140, y);
      doc.text(`-${order.discountAmount.toFixed(2)}€`, 175, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }

    if (order.shippingCost > 0) {
      y += 7;
      doc.text('Spedizione:', 140, y);
      doc.text(`${order.shippingCost.toFixed(2)}€`, 175, y, { align: 'right' });
    }

    y += 10;
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTALE:', 140, y);
    doc.text(`${order.totalAmount.toFixed(2)}€`, 175, y, { align: 'right' });

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('Grazie per il tuo acquisto su Zazarap!', 105, 280, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=invoice-${order.orderNumber}.pdf`
      }
    });

  } catch (error) {
    console.error('Invoice generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});