import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { z } from 'npm:zod@3.24.2';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';

// Simple helper to safely read JSON body
async function readJson(req) {
  try { return await req.json(); } catch { return {}; }
}

// Schema to validate and harden incoming payload
const payloadSchema = z.object({
  message: z.string().min(1).max(4000),
  locale: z.enum(['de', 'it', 'en']).optional().default('de'),
  topic: z.string().max(128).optional(),
  context: z.record(z.any()).optional()
}).strip();

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Correlation ID (from header or generated)
    const incomingCid = req.headers.get('x-correlation-id');
    const correlationId = incomingCid && incomingCid.length <= 128 ? incomingCid : (crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);

    // Rate limit per IP/user
    const rl = await checkRateLimit(req, 'invokeAdminAgent', { limit: 20, windowSec: 60 });
    if (!rl.allowed) {
      return new Response(JSON.stringify({ error: 'Zu viele Anfragen', correlationId, retryAfter: rl.retryAfter }), withSecurityHeaders({ status: 429, headers: { 'Content-Type': 'application/json' } }));
    }

    // Authenticate and ensure admin role
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      // Unauthorized
      await base44.asServiceRole.entities.SystemLog.create({
        level: 'warn',
        message: 'ADMIN_AGENT_UNAUTHORIZED',
        details: `Unauthenticated request to invokeAdminAgent`,
        context: JSON.stringify({ correlationId }),
        path: '/functions/invokeAdminAgent',
        userId: 'anonymous',
        source: 'backend'
      }).catch(() => {});
      return new Response(JSON.stringify({ error: 'Unauthorized', correlationId }), withSecurityHeaders({ status: 401, headers: { 'Content-Type': 'application/json' } }));
    }

    if (user.role !== 'admin') {
      // Access denied for non-admins
      await base44.asServiceRole.entities.SystemLog.create({
        level: 'warn',
        message: 'ADMIN_AGENT_ACCESS_DENIED',
        details: `User without admin role attempted to invoke admin agent`,
        context: JSON.stringify({ correlationId, user: user.email }),
        path: '/functions/invokeAdminAgent',
        userId: user.email,
        source: 'backend'
      }).catch(() => {});
      return new Response(JSON.stringify({ error: 'Forbidden', correlationId }), withSecurityHeaders({ status: 403, headers: { 'Content-Type': 'application/json' } }));
    }

    // Parse and validate payload
    const raw = await readJson(req);
    const parsed = payloadSchema.safeParse(raw);
    if (!parsed.success) {
      await base44.asServiceRole.entities.SystemLog.create({
        level: 'warn',
        message: 'ADMIN_AGENT_PAYLOAD_INVALID',
        details: JSON.stringify(parsed.error.issues),
        context: JSON.stringify({ correlationId, rawKeys: Object.keys(raw || {}) }),
        path: '/functions/invokeAdminAgent',
        userId: user.email,
        source: 'backend'
      }).catch(() => {});
      return new Response(JSON.stringify({ error: 'Ungültige Eingabedaten', correlationId }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }

    // Basic hardening: drop potentially sensitive fields if present inadvertently
    const { message, locale, topic, context } = parsed.data;

    // Log invocation intent (audit-safe)
    await base44.asServiceRole.entities.SystemLog.create({
      level: 'info',
      message: 'ADMIN_AGENT_INVOKE',
      details: `Invoking admin agent with ${message.length} chars`,
      context: JSON.stringify({ correlationId, locale, topic }),
      path: '/functions/invokeAdminAgent',
      userId: user.email,
      source: 'backend'
    }).catch(() => {});

    // Service-to-Service call to the agent (no user token forwarded)
    const agentName = 'zazarap_admin_assistent';

    // Create conversation with metadata for traceability
    const conversation = await base44.asServiceRole.agents.createConversation({
      agent_name: agentName,
      metadata: {
        name: `AdminAgent: ${new Date().toISOString()}`,
        description: 'Admin agent invocation via backend function',
        correlationId,
        locale,
        topic,
        userEmail: user.email,
        source: 'backend:function:invokeAdminAgent'
      }
    });

    // Add the admin request as user message
    await base44.asServiceRole.agents.addMessage(conversation, {
      role: 'user',
      content: message,
      metadata: { correlationId, locale, topic, context: context || {} }
    });

    // Poll briefly for a response (best effort), otherwise return 202 with conversation id
    let answer = null;
    let toolCalls = [];
    const maxTries = 20; // ~5s at 250ms
    for (let i = 0; i < maxTries; i++) {
      const fresh = await base44.asServiceRole.agents.getConversation(conversation.id);
      const msgs = fresh?.messages || [];
      // Look for the latest assistant message with content
      for (let j = msgs.length - 1; j >= 0; j--) {
        const m = msgs[j];
        if (m.role === 'assistant' && m.content) {
          answer = m.content;
          toolCalls = m.tool_calls || [];
          break;
        }
      }
      if (answer) break;
      await new Promise(r => setTimeout(r, 250));
    }

    const baseResponse = {
      correlationId,
      conversationId: conversation.id,
      agent: agentName
    };

    if (!answer) {
      // No immediate response yet
      return new Response(
        JSON.stringify({
          ...baseResponse,
          status: 'pending'
        }),
        withSecurityHeaders({ status: 202, headers: { 'Content-Type': 'application/json' } })
      );
    }

    // Success: structured response
    return new Response(
      JSON.stringify({
        ...baseResponse,
        status: 'completed',
        answer,
        toolCalls
      }),
      withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } })
    );
  } catch (error) {
    // Log error with correlation id
    try {
      const base44 = createClientFromRequest(req);
      await base44.asServiceRole.entities.SystemLog.create({
        level: 'error',
        message: 'ADMIN_AGENT_INVOKE_ERROR',
        details: error?.stack || String(error),
        context: JSON.stringify({ correlationId: req.headers.get('x-correlation-id') || null }),
        path: '/functions/invokeAdminAgent',
        source: 'backend'
      });
    } catch (_) {}

    return new Response(JSON.stringify({ error: 'Internal Server Error' }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});