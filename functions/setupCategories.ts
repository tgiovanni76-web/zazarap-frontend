import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export default Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Delete all existing categories
        const existing = await base44.entities.Category.list(1000); // Fetch plenty
        await Promise.all(existing.map(c => base44.entities.Category.delete(c.id)));
        
        // 2. Define new categories
        const structure = {
            "motoren": {
                "name": "Motoren",
                "icon": "Car",
                "children": {
                    "gebrauchtwagen": "Gebrauchtwagen",
                    "kleinwagen": "Kleinwagen",
                    "suvs": "SUVs",
                    "kombis": "Kombis",
                    "limousinen": "Limousinen",
                    "transporter": "Transporter",
                    "elektroautos": "Elektroautos",
                    "hybridfahrzeuge": "Hybridfahrzeuge",
                    "oldtimer": "Oldtimer",
                    "nutzfahrzeuge": "Nutzfahrzeuge",
                    "motorräder": "Motorräder",
                    "motorroller": "Motorroller",
                    "enduro": "Enduro",
                    "chopper": "Chopper",
                    "elektroroller": "Elektroroller",
                    "autoteile": "Autoteile",
                    "motorradteile": "Motorradteile",
                    "reifen_felgen": "Reifen & Felgen",
                    "zubehör_tuning": "Zubehör & Tuning"
                }
            },
            "markt": {
                "name": "Markt",
                "icon": "ShoppingBag",
                "children": {
                    "smartphones": "Smartphones",
                    "computer_laptops": "Computer & Laptops",
                    "fernseher_audio": "Fernseher & Audio",
                    "tablets": "Tablets",
                    "kameras": "Kameras",
                    "spielekonsolen": "Spielekonsolen",
                    "möbel": "Möbel",
                    "haushaltsgeräte": "Haushaltsgeräte",
                    "garten_werkzeuge": "Garten & Werkzeuge",
                    "lampen_deko": "Lampen & Deko",
                    "fahrräder": "Fahrräder",
                    "sportgeräte": "Sportgeräte",
                    "spiele_spielzeug": "Spiele & Spielzeug",
                    "musikinstrumente": "Musikinstrumente",
                    "damenmode": "Damenmode",
                    "herrenmode": "Herrenmode",
                    "schuhe": "Schuhe",
                    "taschen_accessoires": "Taschen & Accessoires",
                    "hunde": "Hunde",
                    "katzen": "Katzen",
                    "kleintiere": "Kleintiere",
                    "tierzubehör": "Tierzubehör"
                }
            },
            "immobilien": {
                "name": "Immobilien",
                "icon": "Home",
                "children": {
                    "wohnungen_mieten": "Wohnungen mieten",
                    "häuser_mieten": "Häuser mieten",
                    "wohnungen_kaufen": "Wohnungen kaufen",
                    "häuser_kaufen": "Häuser kaufen"
                }
            },
            "arbeit": {
                "name": "Arbeit",
                "icon": "Briefcase",
                "children": {
                    "vollzeitjobs": "Vollzeitjobs",
                    "teilzeitjobs": "Teilzeitjobs",
                    "minijobs": "Minijobs",
                    "homeoffice": "Homeoffice",
                    "ausbildung": "Ausbildung & Lehrstellen"
                }
            }
        };

        // 3. Create new categories
        let order = 0;
        for (const [key, data] of Object.entries(structure)) {
            const parent = await base44.entities.Category.create({
                name: key,
                icon: data.icon,
                description: data.name,
                order: order++,
                active: true
            });

            let subOrder = 0;
            for (const [subKey, subName] of Object.entries(data.children)) {
                await base44.entities.Category.create({
                    name: subKey,
                    description: subName,
                    parentId: parent.id,
                    order: subOrder++,
                    active: true
                });
            }
        }

        return Response.json({ success: true });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});