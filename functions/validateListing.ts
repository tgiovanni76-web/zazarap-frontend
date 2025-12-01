import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description } = await req.json();

        // LISTA PAROLE VIETATE (DE + altre lingue)
        const forbidden = [
            // ARMI
            "waffe", "pistole", "munition", "gewehr", "messer", "schusswaffe",
            "kaliber", "revolver", "armbrust", "munitionen",

            // DROGHE
            "kokain", "cannabis", "gras", "weed", "mdma", "ecstasy",
            "heroin", "meth", "lsd", "pilze", "magic mushrooms",

            // FARMACI / MEDICALI
            "arznei", "medizin", "antibiotikum", "verschreibungspflichtig",
            "viagra", "oxycodon", "tramadol",

            // PORNOGRAFIA
            "porno", "pornografisch", "xxx", "sexfilm",

            // ANIMALI PROTETTI
            "geschützte art", "papagei", "exotisches tier", "tiger", "affe",

            // SIMBOLI POLITICI ILLEGALI
            "ss", "nazis", "hitler", "hakenkreuz",

            // TABACCO/ALCOL
            "zigaretten", "tabak", "alkohol", "vodka", "whisky",

            // GIOCO D'AZZARDO
            "casino", "wetten", "sportwetten",

            // SERVIZI ILLEGALI
            "hack", "hacking", "falscher ausweis", "geldwäsche",

            // ALTRE LINGUE
            "droghe", "arma", "pistola", "porno", "cocaina", "heroina"
        ];

        const text = `${title || ''} ${description || ''}`.toLowerCase();

        for (const word of forbidden) {
            if (text.includes(word)) {
                return Response.json({
                    allowed: false,
                    reason: `Contenuto vietato rilevato: '${word}'`
                });
            }
        }

        return Response.json({ allowed: true });

    } catch (error) {
        return Response.json({ allowed: false, error: error.message }, { status: 500 });
    }
});