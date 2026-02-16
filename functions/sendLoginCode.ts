import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.json();
    const { method, contact } = body;
    
    if (!method || !contact) {
      return Response.json({ success: false, message: 'Method and contact required' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store login code in temporary storage (UserVerification entity, repurposing it)
    // Use contact as userId for unauthenticated requests
    const tempUserId = `login_${contact}`;
    
    const existingCodes = await base44.asServiceRole.entities.UserVerification.filter({ 
      userId: tempUserId 
    });
    
    if (existingCodes.length > 0) {
      await base44.asServiceRole.entities.UserVerification.update(existingCodes[0].id, {
        verificationCode: code,
        codeExpiry: expiryDate.toISOString()
      });
    } else {
      await base44.asServiceRole.entities.UserVerification.create({
        userId: tempUserId,
        verificationCode: code,
        codeExpiry: expiryDate.toISOString(),
        emailVerified: false,
        phoneVerified: false,
        identityVerified: false,
        trustScore: 50
      });
    }

    // Send code via email
    if (method === 'email') {
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Zazarap',
        to: contact,
        subject: '🔐 Dein Zazarap Login-Code',
        body: `Hallo!

Dein Einmalcode für die Anmeldung bei Zazarap lautet:

🔐 ${code}

Dieser Code ist 15 Minuten gültig.

Du hast diesen Code nicht angefordert? Ignoriere diese E-Mail einfach.

Viel Spaß beim Kaufen und Verkaufen!
Dein Zazarap Team

---
Zazarap.de - Dein sicherer Kleinanzeigen-Marktplatz`
      });

      console.log('Login code sent via email to:', contact);

      return Response.json({ 
        success: true,
        message: 'Code per E-Mail gesendet'
      });

    } else if (method === 'phone') {
      // SMS fallback: Notify admin
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Zazarap System',
        to: 'info@zazarap.com',
        subject: `📱 Login-SMS für ${contact}`,
        body: `Login-Code angefordert für: ${contact}

Code: ${code}

⚠️ SMS-Gateway nicht konfiguriert.
Für automatischen SMS-Versand, konfiguriere Twilio oder einen anderen Provider.`
      });

      return Response.json({ 
        success: true,
        message: 'SMS-Code angefordert',
        warning: 'SMS-Gateway nicht aktiv'
      });
    }

    return Response.json({ success: false, message: 'Invalid method' }, { status: 400 });

  } catch (error) {
    console.error('Send login code error:', error);
    return Response.json({ 
      success: false,
      message: error.message || 'Fehler beim Senden',
      details: error.toString()
    }, { status: 500 });
  }
});