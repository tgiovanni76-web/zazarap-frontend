import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.json();
    const { email, code } = body;
    
    if (!email || !code) {
      console.error('[OTP] Missing email or code in request');
      return Response.json({ 
        success: false, 
        message: 'E-Mail und Code erforderlich' 
      }, { status: 400 });
    }

    console.log(`[OTP] Verifying code for ${email}`);

    // Get verification record
    const tempUserId = `login_${email}`;
    const verifications = await base44.asServiceRole.entities.UserVerification.filter({ 
      userId: tempUserId 
    });
    
    if (verifications.length === 0) {
      console.error(`[OTP] No code found for ${email}`);
      return Response.json({ 
        success: false, 
        message: 'Kein Code gefunden. Bitte erneut anfordern.' 
      }, { status: 404 });
    }

    const verification = verifications[0];

    // Check if code expired
    if (new Date(verification.codeExpiry) < new Date()) {
      console.error(`[OTP] Code expired for ${email}`);
      return Response.json({ 
        success: false, 
        message: 'Code abgelaufen. Bitte neuen Code anfordern.' 
      }, { status: 400 });
    }

    // Check if code matches
    if (verification.verificationCode !== code) {
      console.error(`[OTP] Invalid code for ${email}. Expected: ${verification.verificationCode}, Got: ${code}`);
      return Response.json({ 
        success: false, 
        message: 'Ungültiger Code' 
      }, { status: 400 });
    }

    console.log(`[OTP] Code verified successfully for ${email}`);

    // Check if user exists
    const existingUsers = await base44.asServiceRole.entities.User.filter({ 
      email: email 
    });

    let isNewUser = false;

    if (existingUsers.length === 0) {
      // AUTO-PROVISION: Create new user via invite
      console.log(`[OTP] User ${email} does not exist, creating via invite...`);
      
      try {
        await base44.asServiceRole.users.inviteUser(email, 'user');
        isNewUser = true;
        console.log(`[OTP] Successfully invited new user: ${email}`);
        
        // Send welcome email with instructions
        await base44.asServiceRole.integrations.Core.SendEmail({
          from_name: 'Zazarap.de',
          to: email,
          subject: '🎉 Willkommen bei Zazarap.de!',
          body: `Hallo!

Dein Konto wurde erfolgreich erstellt! 🎉

Du hast eine separate E-Mail mit einem Login-Link erhalten. Klicke auf den Link, um dich anzumelden und dein Profil zu vervollständigen.

Falls du keine E-Mail erhalten hast, prüfe bitte deinen Spam-Ordner.

Viel Spaß beim Kaufen und Verkaufen!
Dein Zazarap.de Team

---
Zazarap.de - Dein sicherer Kleinanzeigen-Marktplatz`
        });
        
      } catch (inviteError) {
        console.error(`[OTP] Invite failed:`, inviteError);
        // User might already exist, continue
      }
    } else {
      console.log(`[OTP] User ${email} already exists`);
    }

    // Clear the verification code
    await base44.asServiceRole.entities.UserVerification.delete(verification.id);
    console.log(`[OTP] Deleted verification code for ${email}`);

    return Response.json({ 
      success: true,
      isNewUser,
      message: isNewUser 
        ? 'Konto erstellt! Prüfe deine E-Mails für den Login-Link.' 
        : 'Verifiziert! Prüfe deine E-Mails für den Login-Link.',
      email
    });

  } catch (error) {
    console.error('[OTP] Verify login code error:', error);
    console.error('[OTP] Error stack:', error.stack);
    
    return Response.json({ 
      success: false,
      message: 'Verifizierungsfehler: ' + error.message,
      error: error.toString(),
      stack: error.stack
    }, { status: 500 });
  }
});