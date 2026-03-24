import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

export default Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. Delete all existing categories
        const existing = await base44.asServiceRole.entities.Category.list();
        for (const cat of existing) {
            await base44.asServiceRole.entities.Category.delete(cat.id);
        }

        // 2. NEW CATEGORY LIST (German)
        const categories = [
            { name: "Fahrzeuge", icon: "Car", order: 1 },
            { name: "Autos", icon: "Car", order: 2 },
            { name: "Motorräder", icon: "Bike", order: 3 },
            { name: "Roller", icon: "Bike", order: 4 },
            { name: "Nutzfahrzeuge", icon: "Truck", order: 5 },
            { name: "E-Scooter", icon: "Bike", order: 6 },

            { name: "Immobilien", icon: "Home", order: 7 },
            { name: "Wohnungen & Häuser", icon: "Home", order: 8 },
            { name: "Mietobjekte", icon: "Home", order: 9 },
            { name: "Zimmer", icon: "Home", order: 10 },

            { name: "Marktplatz", icon: "ShoppingBag", order: 11 },
            { name: "Elektronik", icon: "Laptop", order: 12 },
            { name: "Sport & Freizeit", icon: "Bike", order: 13 },
            { name: "Möbel", icon: "Home", order: 14 },
            { name: "Haushalt & Küche", icon: "Home", order: 15 },
            { name: "Videospiele", icon: "Gamepad2", order: 16 },
            { name: "Bücher", icon: "Book", order: 17 },
            { name: "Musik & Filme", icon: "Music", order: 18 },
            { name: "Kleidung", icon: "Shirt", order: 19 },
            { name: "Kinder", icon: "Baby", order: 20 },
            { name: "Garten", icon: "Flower2", order: 21 },
            { name: "Heimwerken", icon: "Wrench", order: 22 },
            { name: "Beauty & Pflege", icon: "Sparkles", order: 23 },

            { name: "Tiere", icon: "PawPrint", order: 24 },
            { name: "Hunde", icon: "PawPrint", order: 25 },
            { name: "Katzen", icon: "PawPrint", order: 26 },
            { name: "Vögel", icon: "PawPrint", order: 27 },
            { name: "Fische", icon: "PawPrint", order: 28 },
            { name: "Nagetiere", icon: "PawPrint", order: 29 },
            { name: "Reptilien (legal)", icon: "PawPrint", order: 30 },
            { name: "Tierzubehör", icon: "PawPrint", order: 31 },

            { name: "Jobs", icon: "Briefcase", order: 32 },
            { name: "Stellenangebote", icon: "Briefcase", order: 33 },
            { name: "Lebenslauf", icon: "FileText", order: 34 },

            { name: "Dienstleistungen", icon: "HandHelping", order: 35 },
            { name: "Nachhilfe", icon: "GraduationCap", order: 36 },
            { name: "Reinigungsservice", icon: "Sparkles", order: 37 },
            { name: "Transport & Umzüge", icon: "Truck", order: 38 },
            { name: "Reparaturen", icon: "Wrench", order: 39 }
        ];

        // 3. INSERT THEM INTO DATABASE
        for (const c of categories) {
            await base44.asServiceRole.entities.Category.create({
                name: c.name,
                icon: c.icon,
                description: null,
                parentId: null,
                subcategories: [],
                active: true,
                order: c.order
            });
        }

        return Response.json({ success: true, message: "German categories installed successfully" });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});