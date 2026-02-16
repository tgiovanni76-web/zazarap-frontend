import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const body = await req.json();
    const { method, contact, code } = body;
    
    if (!method || !contact || !code) {
      return Response.json({ 
        success: false, 
        message: 'Method, contact and code required' 
      }, { status: 400 });
    }

    // Get verification record
    const tempUserId = `login_${contact}`;
    const verifications = await base44.asServiceRole.entities.UserVerification.filter({ 
      userId: tempUserId 
    });
    
    if (verifications.length === 0) {
      return Response.json({ 
        success: false, 
        message: 'Kein Code gefunden. Bitte erneut anfordern.' 
      }, { status: 404 });
    }

    const verification = verifications[0];

    // Check if code expired
    if (new Date(verification.codeExpiry) < new Date()) {
      return Response.json({ 
        success: false, 
        message: 'Code abgelaufen. Bitte neuen Code anfordern.' 
      }, { status: 400 });
    }

    // Check if code matches
    if (verification.verificationCode !== code) {
      return Response.json({ 
        success: false, 
        message: 'Ungültiger Code' 
      }, { status: 400 });
    }

    // Code is valid! Now check if user exists
    let userEmail = method === 'email' ? contact : null;
    let isNewUser = false;

    if (method === 'email') {
      // Check if user with this email exists
      const existingUsers = await base44.asServiceRole.entities.User.filter({ 
        email: contact 
      });

      if (existingUsers.length === 0) {
        // AUTO-PROVISION: Create new user account
        try {
          // Use Base44's invite system to create user
          await base44.asServiceRole.users.inviteUser(contact, 'user');
          isNewUser = true;
          console.log('New user auto-provisioned:', contact);
        } catch (inviteError) {
          console.log('User might already exist or invite failed:', inviteError);
          // Continue anyway - they might have an account already
        }
      }

      userEmail = contact;
    } else {
      // Phone method: try to find user by phone or create new one
      // For now, we'll require them to complete profile with email
      isNewUser = true;
    }

    // Clear the verification code
    await base44.asServiceRole.entities.UserVerification.delete(verification.id);

    // Generate session token (in production, use JWT or Base44's session system)
    const sessionToken = `otp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Store session info temporarily
    await base44.asServiceRole.entities.UserVerification.create({
      userId: `session_${sessionToken}`,
      verificationCode: userEmail || contact,
      codeExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h session
      emailVerified: method === 'email',
      phoneVerified: method === 'phone',
      identityVerified: true,
      trustScore: 70
    });

    console.log(`Login successful for ${contact}, isNewUser: ${isNewUser}`);

    return Response.json({ 
      success: true,
      sessionToken,
      isNewUser,
      userEmail,
      message: 'Login erfolgreich'
    });

  } catch (error) {
    console.error('Verify login code error:', error);
    return Response.json({ 
      success: false,
      message: error.message || 'Verifizierungsfehler',
      details: error.toString()
    }, { status: 500 });
  }
});