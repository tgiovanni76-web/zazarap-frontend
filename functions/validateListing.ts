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
            "kaliber", "revolver", "armbrust", "munitionen", "waffen",

            // DROGHE
            "kokain", "cannabis", "gras", "weed", "mdma", "ecstasy",
            "heroin", "meth", "lsd", "pilze", "magic mushrooms", "marihuana",
            "amphetamin", "crystal", "crack", "opium",

            // FARMACI / MEDICALI
            "arznei", "medizin", "antibiotikum", "verschreibungspflichtig",
            "viagra", "oxycodon", "tramadol", "rezeptpflichtig",

            // PORNOGRAFIA
            "porno", "pornografisch", "xxx", "sexfilm", "erotik", "nackt",

            // ANIMALI PROTETTI
            "geschützte art", "papagei", "exotisches tier", "tiger", "affe",
            "elfenbein", "schildkröte", "schlangenleder",

            // SIMBOLI POLITICI ILLEGALI
            "nazi", "hitler", "hakenkreuz", "reichsadler", "swastika",

            // TABACCO/ALCOL
            "zigaretten", "tabak", "alkohol", "vodka", "whisky", "schnaps",

            // GIOCO D'AZZARDO
            "casino", "wetten", "sportwetten", "glücksspiel",

            // SERVIZI ILLEGALI
            "hack", "hacking", "falscher ausweis", "geldwäsche", "fälschung",
            "betrug", "darknet", "schwarzmarkt",

            // ALTRE LINGUE
            "droghe", "arma", "pistola", "cocaina", "heroina", "droga",
            "weapon", "gun", "drugs", "cocaine", "heroine"
        ];

        // Normalizza il testo: rimuove caratteri speciali, sostituzioni comuni
        const normalizeText = (text) => {
            if (!text) return '';
            
            let normalized = text.toLowerCase();
            
            // Sostituzioni caratteri speciali comuni (leetspeak e varianti)
            const substitutions = {
                '0': 'o', 'ø': 'o', 'ö': 'o', 'ó': 'o', 'ò': 'o',
                '1': 'i', '!': 'i', 'í': 'i', 'ì': 'i', 'î': 'i',
                '3': 'e', '€': 'e', 'ë': 'e', 'é': 'e', 'è': 'e', 'ê': 'e',
                '4': 'a', '@': 'a', 'ä': 'a', 'á': 'a', 'à': 'a', 'â': 'a',
                '5': 's', '$': 's', 'ß': 'ss',
                '7': 't',
                '8': 'b',
                '9': 'g',
                'ü': 'u', 'ú': 'u', 'ù': 'u', 'û': 'u',
                'ñ': 'n',
                'ç': 'c',
                'ph': 'f',
                'kk': 'k', 'ck': 'k',
                'ff': 'f',
                'ss': 's',
                'nn': 'n',
                'mm': 'm',
                'tt': 't',
                'pp': 'p',
                'cc': 'c',
                'xx': 'x',
                'vv': 'v', 'w': 'v'  // w come variante di v
            };
            
            // Applica sostituzioni
            for (const [from, to] of Object.entries(substitutions)) {
                normalized = normalized.split(from).join(to);
            }
            
            // Rimuovi spazi, trattini, underscore, punti tra lettere (p.i.s.t.o.l.a)
            normalized = normalized.replace(/[\s\-_\.,:;!?'"()[\]{}]/g, '');
            
            // Rimuovi numeri ripetuti usati come separatori
            normalized = normalized.replace(/(\d)\1+/g, '$1');
            
            return normalized;
        };

        // Genera varianti della parola vietata
        const generateVariants = (word) => {
            const variants = [word];
            
            // Versione senza spazi
            variants.push(word.replace(/\s/g, ''));
            
            // Versione con raddoppi rimossi
            variants.push(word.replace(/(.)\1+/g, '$1'));
            
            return variants;
        };

        const originalText = `${title || ''} ${description || ''}`;
        const normalizedText = normalizeText(originalText);
        
        // Check anche sul testo originale (lowercase)
        const lowerOriginal = originalText.toLowerCase();

        for (const word of forbidden) {
            const variants = generateVariants(word);
            
            for (const variant of variants) {
                const normalizedVariant = normalizeText(variant);
                
                // Check su testo normalizzato
                if (normalizedText.includes(normalizedVariant)) {
                    console.log("Bloccato annuncio illegale:", {
                        title,
                        wordBlocked: word,
                        matchedVariant: variant,
                        language: req.headers.get("accept-language") || "unknown",
                        normalized: true
                    });
                    return Response.json({
                        allowed: false,
                        reason: `Dieses Angebot ist auf Zazarap nicht erlaubt.`
                    });
                }
                
                // Check su testo originale
                if (lowerOriginal.includes(variant)) {
                    console.log("Bloccato annuncio illegale:", {
                        title,
                        wordBlocked: word,
                        language: req.headers.get("accept-language") || "unknown",
                        normalized: false
                    });
                    return Response.json({
                        allowed: false,
                        reason: `Dieses Angebot ist auf Zazarap nicht erlaubt.`
                    });
                }
            }
        }

        // Pattern sospetti aggiuntivi (regex)
        const suspiciousPatterns = [
            /w[\W_]*a[\W_]*f[\W_]*f[\W_]*e/i,      // w.a.f.f.e
            /p[\W_]*i[\W_]*s[\W_]*t[\W_]*o[\W_]*l/i, // p.i.s.t.o.l
            /d[\W_]*r[\W_]*o[\W_]*g/i,              // d.r.o.g
            /k[\W_]*o[\W_]*k[\W_]*a[\W_]*i[\W_]*n/i, // k.o.k.a.i.n
            /h[\W_]*e[\W_]*r[\W_]*o[\W_]*i[\W_]*n/i, // h.e.r.o.i.n
            /c[\W_]*a[\W_]*n[\W_]*n[\W_]*a[\W_]*b/i, // c.a.n.n.a.b
            /p[\W_]*o[\W_]*r[\W_]*n[\W_]*o/i,       // p.o.r.n.o
            /n[\W_]*a[\W_]*z[\W_]*i/i,              // n.a.z.i
            /h[\W_]*i[\W_]*t[\W_]*l[\W_]*e[\W_]*r/i, // h.i.t.l.e.r
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(originalText)) {
                console.log("Bloccato annuncio per pattern sospetto:", {
                    title,
                    pattern: pattern.toString(),
                    language: req.headers.get("accept-language") || "unknown"
                });
                return Response.json({
                    allowed: false,
                    reason: `Dieses Angebot ist auf Zazarap nicht erlaubt.`
                });
            }
        }

        return Response.json({ allowed: true });

    } catch (error) {
        return Response.json({ allowed: false, error: error.message }, { status: 500 });
    }
});