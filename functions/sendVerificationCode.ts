import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { method, value } = await req.json();
    
    if (!method || !value) {
      return Response.json({ error: 'Method and value required' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification code
    const verifications = await base44.entities.UserVerification.filter({ userId: user.email });
    
    if (verifications.length > 0) {
      await base44.asServiceRole.entities.UserVerification.update(verifications[0].id, {
        verificationCode: code,
        codeExpiry: expiryDate.toISOString()
      });
    } else {
      await base44.asServiceRole.entities.UserVerification.create({
        userId: user.email,
        verificationCode: code,
        codeExpiry: expiryDate.toISOString(),
        emailVerified: false,
        phoneVerified: false
      });
    }

    // Send verification code
    if (method === 'email') {
      await base44.integrations.Core.SendEmail({
        to: value,
        subject: 'Zazarap - Dein Verifizierungscode',
        body: `
Hallo,

Dein Verifizierungscode für Zazarap lautet:

${code}

Dieser Code ist 15 Minuten gültig.

Viele Grüße,
Dein Zazarap Team
        `
      });
    } else if (method === 'phone') {
      // For phone: In production, integrate with SMS provider (Twilio, AWS SNS, etc.)
      // For now, send email notification to admin
      await base44.integrations.Core.SendEmail({
        to: 'info@zazarap.com',
        subject: `SMS-Verifizierungscode für ${user.email}`,
        body: `
Benutzer ${user.email} hat SMS-Verifizierung angefordert.

Telefon: ${value}
Code: ${code}

Bitte SMS manuell senden oder SMS-Integration einrichten.
        `
      });
    }

    return Response.json({ 
      success: true,
      message: method === 'email' ? 'Code per E-Mail gesendet' : 'SMS-Code angefordert (manuelle Verarbeitung)'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});