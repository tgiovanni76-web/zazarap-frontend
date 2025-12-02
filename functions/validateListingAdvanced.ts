import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title = "", description = "", categoryName = "" } = await req.json();

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

    return Response.json({ allowed: true });

  } catch (err) {
    return Response.json({ allowed: false, error: err.message }, { status: 500 });
  }
});