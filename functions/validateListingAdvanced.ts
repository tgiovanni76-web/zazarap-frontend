import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { checkRateLimit } from './_lib/rateLimit.js';
import { withSecurityHeaders } from './_lib/securityHeaders.js';
import { listingCreateSchema } from './_lib/validation.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Rate limiting
    const rl = await checkRateLimit(req, 'validateListingAdvanced', { limit: 20, windowSec: 60 });
    if (!rl.allowed) {
      return Response.json({ error: 'Rate limit exceeded', resetAt: rl.resetAt }, { status: 429 });
    }

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json().catch(() => ({}));
    const parsed = listingCreateSchema.safeParse({ title: payload.title, description: payload.description, category: payload.categoryName });
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Ungültige Eingabedaten', details: parsed.error.issues }), withSecurityHeaders({ status: 400, headers: { 'Content-Type': 'application/json' } }));
    }
    const { title = "", description = "", categoryName = "" } = parsed.data;

    const text = `${title} ${description}`.toLowerCase();

    const rules = [
      // ARMI
      { pattern: "waffe", severity: "high" },
      { pattern: "pistole", severity: "high" },
      { pattern: "gewehr", severity: "high" },
      { pattern: "munition", severity: "high" },
      { pattern: "schusswaffe", severity: "high" },
      { pattern: "armbrust", severity: "high" },
      { pattern: "elektroschocker", severity: "high" },
      { pattern: "schlagstock", severity: "high" },
      { pattern: "pfefferspray", severity: "medium" },

      // DROGHE
      { pattern: "kokain", severity: "high" },
      { pattern: "cannabis", severity: "high" },
      { pattern: "heroin", severity: "high" },
      { pattern: "mdma", severity: "high" },
      { pattern: "ecstasy", severity: "high" },
      { pattern: "gras", severity: "high" },
      { pattern: "weed", severity: "high" },
      { pattern: "lsd", severity: "high" },
      { pattern: "marihuana", severity: "high" },

      // FARMACI
      { pattern: "viagra", severity: "medium" },
      { pattern: "arzneimittel", severity: "medium" },
      { pattern: "verschreibungspflichtig", severity: "medium" },
      { pattern: "oxycodon", severity: "high" },
      { pattern: "tramadol", severity: "high" },
      { pattern: "morphin", severity: "high" },

      // PORNO / CONTENUTI 18+
      { pattern: "porno", severity: "high" },
      { pattern: "pornografisch", severity: "high" },
      { pattern: "xxx", severity: "high" },
      { pattern: "erotik", severity: "medium" },

      // GIOCO D'AZZARDO
      { pattern: "casino", severity: "medium" },
      { pattern: "sportwetten", severity: "medium" },
      { pattern: "wetten", severity: "medium" },
      { pattern: "glücksspiel", severity: "medium" },

      // DOCUMENTI / ILLEGALE
      { pattern: "falscher ausweis", severity: "high" },
      { pattern: "geldwäsche", severity: "high" },
      { pattern: "hacking", severity: "high" },
      { pattern: "hack", severity: "high" },
      { pattern: "gefälschte", severity: "medium" },
      { pattern: "fälschung", severity: "medium" },

      // SOSTANZE CHIMICHE
      { pattern: "radioaktiv", severity: "high" },
      { pattern: "explosiv", severity: "high" },
      { pattern: "gift", severity: "medium" },
      { pattern: "säure", severity: "medium" },

      // ANIMALI PROTETTI
      { pattern: "elfenbein", severity: "high" },
      { pattern: "geschützte tierart", severity: "high" },

      // ALCUNE PAROLE IN ITALIANO
      { pattern: "cocaina", severity: "high" },
      { pattern: "eroina", severity: "high" },
      { pattern: "arma da fuoco", severity: "high" }
    ];

    const matches = [];

    for (const rule of rules) {
      if (text.includes(rule.pattern)) {
        matches.push(rule);
      }
    }

    if (matches.length > 0) {
      const hasHigh = matches.some(m => m.severity === "high");
      return Response.json({
        allowed: false,
        severity: hasHigh ? "high" : "medium",
        reasons: matches.map(m => m.pattern)
      });
    }

    return new Response(JSON.stringify({ allowed: true }), withSecurityHeaders({ status: 200, headers: { 'Content-Type': 'application/json' } }));

  } catch (err) {
    return new Response(JSON.stringify({ allowed: false, error: err.message }), withSecurityHeaders({ status: 500, headers: { 'Content-Type': 'application/json' } }));
  }
});