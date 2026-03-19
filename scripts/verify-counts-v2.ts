
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.error("Starting detailed audit...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");
        // 1. Get all active categories
        const [allCats] = await connection.execute("SELECT id, name, slug, parent_id FROM categories WHERE is_active=1") as any[];

        // 2. Get all products
        const [products] = await connection.execute("SELECT id, name, category_path FROM products") as any[];
        console.error(`Total products in DB: ${products.length}`);

        // Analyze 'Solar & Power' (slug='solar')
        const solar = allCats.find((c: any) => c.slug === 'solar');
        if (solar) {
            console.error("\n--- Analyzing 'Solar & Power' ---");

            // Current Logic: LIKE '%solar%'
            const currentMatches = products.filter((p: any) => p.category_path.includes('solar'));
            console.error(`Current Logic Candidates (${currentMatches.length}):`);
            currentMatches.forEach((p: any) => console.error(` [X] ${p.name} (${p.category_path})`));

            // Actual Logic: Recursive Children
            const getDescendants = (parentId: string): string[] => {
                const children = allCats.filter((c: any) => c.parent_id === parentId);
                let slugs = children.map((c: any) => c.slug);
                for (const child of children) {
                    slugs = [...slugs, ...getDescendants(child.id)];
                }
                return slugs;
            };

            const validSlugs = ['solar', ...getDescendants(solar.id)];
            console.error(`\nValid Slugs for Solar: ${validSlugs.join(', ')}`);

            const actualMatches = products.filter((p: any) => validSlugs.includes(p.category_path));
            console.error(`Actual Logic Candidates (${actualMatches.length}):`);
            actualMatches.forEach((p: any) => console.error(` [V] ${p.name} (${p.category_path})`));

            console.error("\n--- Discrepancy Analysis ---");
            const inCurrentNotActual = currentMatches.filter((p: any) => !actualMatches.includes(p));
            const inActualNotCurrent = actualMatches.filter((p: any) => !currentMatches.includes(p));

            if (inCurrentNotActual.length > 0) {
                console.error("Products counted by Current but NOT Actual (Overcounting?):");
                inCurrentNotActual.forEach((p: any) => console.error(` - ${p.name} (${p.category_path})`));
            } else {
                console.error("No overcounting found.");
            }

            if (inActualNotCurrent.length > 0) {
                console.error("Products counted by Actual but NOT Current (Undercounting):");
                inActualNotCurrent.forEach((p: any) => console.error(` - ${p.name} (${p.category_path})`));
            } else {
                console.error("No undercounting found.");
            }
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
