import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  
  try {
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { method, code } = body;
    
    if (!method || !code) {
      return Response.json({ error: 'Method and code required' }, { status: 400 });
    }

    // Get verification record using service role
    const verifications = await base44.asServiceRole.entities.UserVerification.filter({ userId: user.email });
    
    if (verifications.length === 0) {
      return Response.json({ verified: false, error: 'No verification found' }, { status: 404 });
    }

    const verification = verifications[0];

    // Check if code expired
    if (new Date(verification.codeExpiry) < new Date()) {
      return Response.json({ verified: false, error: 'Code expired' }, { status: 400 });
    }

    // Check if code matches
    if (verification.verificationCode !== code) {
      return Response.json({ verified: false, error: 'Invalid code' }, { status: 400 });
    }

    // Update verification status
    const updateData = method === 'email' 
      ? { emailVerified: true } 
      : { phoneVerified: true };

    await base44.asServiceRole.entities.UserVerification.update(verification.id, {
      ...updateData,
      verificationCode: null, // Clear code after successful verification
      trustScore: Math.min(100, (verification.trustScore || 50) + 15) // Increase trust score
    });

    console.log(`User ${user.email} verified ${method} successfully`);

    return Response.json({ 
      verified: true,
      method,
      message: 'Verifizierung erfolgreich'
    });

  } catch (error) {
    console.error('Verification error:', error);
    return Response.json({ 
      error: error.message || 'Verifizierungsfehler',
      details: error.toString()
    }, { status: 500 });
  }
});