// Scheduled task per monitoraggio automatico spedizioni
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // Nessuna autenticazione utente per scheduled task
    const base44 = createClientFromRequest(req);
    
    // Invoca il monitoraggio
    const result = await base44.asServiceRole.functions.invoke('monitorShippingIssues', {});
    
    return Response.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result.data
    });
    
  } catch (error) {
    console.error('Scheduled monitoring error:', error);
    return Response.json({ 
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
});