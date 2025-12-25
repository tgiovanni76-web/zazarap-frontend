import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { jsPDF } from 'npm:jspdf@2.5.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transactionId } = await req.json();

    // Get transaction
    const transactions = await base44.entities.Transaction.filter({ 
      id: transactionId,
      userId: user.email 
    });

    if (transactions.length === 0) {
      return Response.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const transaction = transactions[0];

    // Check if invoice already exists
    let invoice = (await base44.entities.Invoice.filter({ transactionId }))[0];

    if (!invoice) {
      // Generate invoice number
      const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      
      // Calculate VAT (22% for Italy/EU)
      const vatRate = 0.22;
      const amountBeforeVat = transaction.amount / (1 + vatRate);
      const vatAmount = transaction.amount - amountBeforeVat;

      invoice = await base44.entities.Invoice.create({
        userId: user.email,
        invoiceNumber,
        transactionId: transaction.id,
        amount: transaction.amount,
        vatAmount,
        currency: transaction.currency,
        status: 'paid',
        issueDate: new Date().toISOString().split('T')[0],
        items: JSON.stringify([{
          description: transaction.description || 'Servizio marketplace',
          quantity: 1,
          unitPrice: amountBeforeVat,
          total: amountBeforeVat
        }]),
        billingAddress: user.address || '',
        vatNumber: user.vatNumber || ''
      });
    }

    // Generate PDF
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.text('FATTURA', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Zazarap Marketplace', 20, 35);
    doc.text('Via Example, 123', 20, 40);
    doc.text('12345 Berlin, Germania', 20, 45);
    doc.text('P.IVA: DE123456789', 20, 50);

    // Invoice details
    doc.setFontSize(12);
    doc.text(`Fattura N°: ${invoice.invoiceNumber}`, 120, 35);
    doc.text(`Data: ${new Date(invoice.issueDate).toLocaleDateString('it-IT')}`, 120, 42);
    doc.text(`Stato: ${invoice.status.toUpperCase()}`, 120, 49);

    // Customer
    doc.setFontSize(10);
    doc.text('Cliente:', 20, 65);
    doc.text(user.full_name || user.email, 20, 70);
    doc.text(user.email, 20, 75);
    if (invoice.billingAddress) doc.text(invoice.billingAddress, 20, 80);
    if (invoice.vatNumber) doc.text(`P.IVA: ${invoice.vatNumber}`, 20, 85);

    // Items table
    doc.setFontSize(10);
    let y = 100;
    doc.text('Descrizione', 20, y);
    doc.text('Qta', 120, y);
    doc.text('Importo', 160, y);
    
    doc.line(20, y + 2, 190, y + 2);
    y += 10;

    const items = JSON.parse(invoice.items);
    items.forEach(item => {
      doc.text(item.description, 20, y);
      doc.text(String(item.quantity), 120, y);
      doc.text(`€${item.total.toFixed(2)}`, 160, y);
      y += 7;
    });

    // Totals
    y += 10;
    doc.line(120, y, 190, y);
    y += 7;
    
    const subtotal = invoice.amount - invoice.vatAmount;
    doc.text('Imponibile:', 120, y);
    doc.text(`€${subtotal.toFixed(2)}`, 160, y);
    y += 7;
    
    doc.text('IVA 22%:', 120, y);
    doc.text(`€${invoice.vatAmount.toFixed(2)}`, 160, y);
    y += 7;
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('TOTALE:', 120, y);
    doc.text(`€${invoice.amount.toFixed(2)}`, 160, y);

    // Footer
    doc.setFontSize(8);
    doc.text('Grazie per il tuo acquisto su Zazarap', 105, 270, { align: 'center' });

    const pdfBytes = doc.output('arraybuffer');

    // Upload PDF
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfFile = new File([pdfBlob], `${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
    
    const uploadResult = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    // Update invoice with PDF URL
    await base44.entities.Invoice.update(invoice.id, { pdfUrl: uploadResult.file_url });

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${invoice.invoiceNumber}.pdf"`
      }
    });

  } catch (error) {
    console.error('Generate invoice error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});