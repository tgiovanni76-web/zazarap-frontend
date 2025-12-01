import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ allowed: false, decision: 'block', error: 'Unauthorized' }, { status: 401 });
        }

        const { title, description, category } = await req.json();
        const browserLanguage = req.headers.get("accept-language") || "unknown";

        // 1) PAROLE TOTALMENTE VIETATE (blocco immediato)
        const forbidden = [
            // ARMI
            "waffe", "pistole", "munition", "gewehr", "messer", "schusswaffe",
            "kaliber", "revolver", "armbrust", "munitionen", "waffen",

            // DROGHE
            "kokain", "cocaina", "cannabis", "gras", "weed", "mdma", "ecstasy",
            "heroin", "heroina", "eroina", "meth", "lsd", "pilze", "magic mushrooms", 
            "marihuana", "amphetamin", "amfetamina", "anfetamina", "crystal", "crack", 
            "opium", "haschisch",

            // FARMACI / MEDICALI
            "verschreibungspflichtig", "rezeptpflichtig", "viagra", "oxycodon", 
            "tramadol", "anabolika", "steroidi",

            // PORNOGRAFIA
            "porno", "pornografisch", "xxx", "sexfilm", "erotik", "hardcore",

            // SIMBOLI POLITICI ILLEGALI
            "nazi", "nazis", "hitler", "hakenkreuz", "reichsadler", "swastika", "ss uniform",

            // GIOCO D'AZZARDO
            "casino", "kasino", "wetten", "sportwetten", "glücksspiel", "roulette", "slotmaschine",

            // SERVIZI ILLEGALI
            "hack", "hacking", "ddos", "falscher ausweis", "gefälschter ausweis", 
            "fake ausweis", "geldwäsche", "fälschung", "betrug", "darknet", "schwarzmarkt",

            // ALTRE LINGUE
            "droghe", "droga", "arma", "pistola", "weapon", "gun", "drugs", "cocaine"
        ];

        // 2) PAROLE SOSPETTE → revisione manuale
        const suspicious = [
            "kredit", "loan", "darlehen", "gewinngarantie",
            "medizinische beratung", "medizinische dienstleistung",
            "exotisches tier", "geschützte art", "papagei", "schlange",
            "escort", "begleitservice", "elfenbein", "schildkröte", "schlangenleder",
            "tiger", "affe", "nackt", "tabak", "zigaretten", "alkohol", "vodka", "whisky", "schnaps"
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
                'ph': 'f'
            };
            
            for (const [from, to] of Object.entries(substitutions)) {
                normalized = normalized.split(from).join(to);
            }
            
            // Rimuovi spazi, trattini, underscore, punti tra lettere
            normalized = normalized.replace(/[\s\-_\.,:;!?'"()[\]{}]/g, '');
            
            return normalized;
        };

        const originalText = `${title || ''} ${description || ''}`;
        const normalizedText = normalizeText(originalText);
        const lowerOriginal = originalText.toLowerCase();

        let decision = "allow";
        let reason = null;
        let matchedWord = null;

        // Controllo FORBIDDEN (blocco immediato)
        for (const word of forbidden) {
            const normalizedWord = normalizeText(word);
            
            if (normalizedText.includes(normalizedWord) || lowerOriginal.includes(word)) {
                decision = "block";
                reason = "FORBIDDEN_KEYWORD";
                matchedWord = word;
                break;
            }
        }

        // Pattern regex sospetti (blocco immediato)
        if (decision === "allow") {
            const suspiciousPatterns = [
                { pattern: /w[\W_]*a[\W_]*f[\W_]*f[\W_]*e/i, name: "waffe" },
                { pattern: /p[\W_]*i[\W_]*s[\W_]*t[\W_]*o[\W_]*l/i, name: "pistol" },
                { pattern: /d[\W_]*r[\W_]*o[\W_]*g/i, name: "drog" },
                { pattern: /k[\W_]*o[\W_]*k[\W_]*a[\W_]*i[\W_]*n/i, name: "kokain" },
                { pattern: /h[\W_]*e[\W_]*r[\W_]*o[\W_]*i[\W_]*n/i, name: "heroin" },
                { pattern: /c[\W_]*a[\W_]*n[\W_]*n[\W_]*a[\W_]*b/i, name: "cannabis" },
                { pattern: /p[\W_]*o[\W_]*r[\W_]*n[\W_]*o/i, name: "porno" },
                { pattern: /n[\W_]*a[\W_]*z[\W_]*i/i, name: "nazi" },
                { pattern: /h[\W_]*i[\W_]*t[\W_]*l[\W_]*e[\W_]*r/i, name: "hitler" },
            ];

            for (const { pattern, name } of suspiciousPatterns) {
                if (pattern.test(originalText)) {
                    decision = "block";
                    reason = "SUSPICIOUS_PATTERN";
                    matchedWord = name;
                    break;
                }
            }
        }

        // Controllo SUSPICIOUS (revisione manuale)
        if (decision === "allow") {
            for (const word of suspicious) {
                const normalizedWord = normalizeText(word);
                
                if (normalizedText.includes(normalizedWord) || lowerOriginal.includes(word)) {
                    decision = "pending_review";
                    reason = "SUSPICIOUS_KEYWORD";
                    matchedWord = word;
                    break;
                }
            }
        }

        // Regole extra per categoria
        if (decision === "allow" && category === "Tiere") {
            const protectedTerms = ["geschützt", "exotisch", "selten", "wild"];
            for (const term of protectedTerms) {
                if (lowerOriginal.includes(term)) {
                    decision = "pending_review";
                    reason = "PROTECTED_ANIMAL";
                    matchedWord = term;
                    break;
                }
            }
        }

        // Log evento moderazione
        try {
            await base44.asServiceRole.entities.ModerationEvent.create({
                title: title || '',
                description: (description || '').substring(0, 500),
                category: category || '',
                decision,
                reason,
                matchedWord,
                userEmail: user.email,
                browserLanguage
            });
        } catch (logError) {
            console.error("Failed to log moderation event:", logError.message);
        }

        // Log console per debug
        if (decision !== "allow") {
            console.log("Moderazione annuncio:", {
                title,
                decision,
                reason,
                matchedWord,
                userEmail: user.email,
                browserLanguage
            });
        }

        // Risposta
        if (decision === "block") {
            return Response.json({
                allowed: false,
                decision,
                reason,
                matchedWord,
                message: "Dieses Angebot ist auf Zazarap nicht erlaubt."
            });
        }

        if (decision === "pending_review") {
            return Response.json({
                allowed: true,
                decision,
                reason,
                matchedWord,
                message: "Ihr Angebot wird manuell überprüft."
            });
        }

        return Response.json({ 
            allowed: true, 
            decision: "allow" 
        });

    } catch (error) {
        console.error("Validation error:", error.message);
        return Response.json({ 
            allowed: false, 
            decision: "pending_review",
            reason: "ERROR",
            error: error.message 
        }, { status: 500 });
    }
});