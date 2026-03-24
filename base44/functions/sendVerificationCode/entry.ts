import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { method, value } = body;
    
    if (!method || !value) {
      return Response.json({ error: 'Method and value required' }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiryDate = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store verification code using service role
    const verifications = await base44.asServiceRole.entities.UserVerification.filter({ userId: user.email });
    
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
        phoneVerified: false,
        identityVerified: false,
        trustScore: 50
      });
    }

    // Send verification code via email
    if (method === 'email') {
      const emailResult = await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Zazarap',
        to: value,
        subject: 'Zazarap - Dein Verifizierungscode',
        body: `Hallo,

Dein Verifizierungscode für Zazarap lautet:

🔐 ${code}

Dieser Code ist 15 Minuten gültig.

Falls du diese E-Mail nicht angefordert hast, ignoriere sie einfach.

Viele Grüße,
Dein Zazarap Team

---
Zazarap.de - Dein sicherer Kleinanzeigen-Marktplatz`
      });

      console.log('Email sent successfully:', emailResult);

      return Response.json({ 
        success: true,
        message: 'Code per E-Mail gesendet',
        debug: { email: value, codeSent: true }
      });

    } else if (method === 'phone') {
      // SMS integration: For production, use Twilio or similar
      // Example Twilio integration (needs TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER):
      /*
      const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');
      
      if (twilioAccountSid && twilioAuthToken && twilioPhone) {
        const response = await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
          {
            method: 'POST',
            headers: {
              'Authorization': 'Basic ' + btoa(`${twilioAccountSid}:${twilioAuthToken}`),
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: value,
              From: twilioPhone,
              Body: `Dein Zazarap Verifizierungscode: ${code}. Gültig für 15 Minuten.`
            })
          }
        );
        
        if (!response.ok) {
          throw new Error('SMS sending failed');
        }
      }
      */
      
      // Fallback: Send admin notification
      await base44.asServiceRole.integrations.Core.SendEmail({
        from_name: 'Zazarap System',
        to: 'info@zazarap.com',
        subject: `📱 SMS-Verifizierungscode für ${user.email}`,
        body: `Benutzer ${user.email} hat SMS-Verifizierung angefordert.

Telefonnummer: ${value}
Verifizierungscode: ${code}

⚠️ HINWEIS: SMS-Gateway ist nicht konfiguriert.
Um SMS automatisch zu versenden, füge Twilio-Credentials hinzu:
- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN  
- TWILIO_PHONE_NUMBER

Oder nutze einen anderen SMS-Provider wie MessageBird, Vonage, AWS SNS.`
      });

      return Response.json({ 
        success: true,
        message: 'SMS-Code angefordert (Admin benachrichtigt)',
        warning: 'SMS-Gateway nicht konfiguriert - Admin wurde per E-Mail informiert'
      });
    }

    return Response.json({ error: 'Invalid method' }, { status: 400 });

  } catch (error) {
    console.error('Verification code error:', error);
    return Response.json({ 
      error: error.message || 'Fehler beim Senden des Codes',
      details: error.toString()
    }, { status: 500 });
  }
});