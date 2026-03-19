
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.error("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        const category = 'solar'; // Test case

        // 1. Fetch active categories (EXACT QUERY from filters.ts)
        if (!connection) throw new Error("No connection");
        const [allCats] = await connection.execute('SELECT id, parent_id, slug FROM categories WHERE is_active = TRUE') as any[];
        console.error(`Found ${allCats.length} active categories.`);

        const targetCat = allCats.find((c: any) => c.slug === category);

        if (targetCat) {
            console.error(`Target found: ${targetCat.slug} (ID: ${targetCat.id})`);

            const slugsToInclude = [category];

            // Recursive function (EXACT LOGIC from filters.ts)
            const findDescendants = (parentId: string) => {
                const children = allCats.filter((c: any) => c.parent_id === parentId);
                children.forEach((child: any) => {
                    console.error(`- Found child: ${child.slug} (Parent: ${child.parent_id})`);
                    slugsToInclude.push(child.slug);
                    findDescendants(child.id);
                });
            };

            findDescendants(targetCat.id);
            console.error("Slugs to include:", JSON.stringify(slugsToInclude));

            // Query check
            if (slugsToInclude.includes('solar-panels')) {
                console.error("SUCCESS: 'solar-panels' IS included.");
            } else {
                console.error("FAILURE: 'solar-panels' IS NOT included.");
            }

            // DEBUG: Check if products exist at all for these slugs
            for (const slug of slugsToInclude) {
                const [pCount] = await connection.execute('SELECT COUNT(*) as c, inventory_strategy FROM products WHERE category_path = ? GROUP BY inventory_strategy', [slug]) as any[];
                if (pCount.length > 0) {
                    console.error(`Status for '${slug}':`, pCount);
                } else {
                    console.error(`No products found directly for '${slug}'`);
                }
            }

            // Simulate query
            const placeholders = slugsToInclude.map(() => '?').join(',');
            const sql = `SELECT name, category_path FROM products WHERE category_path IN (${placeholders})`;
            console.error("Executing SQL:", sql);

            const [products] = await connection.execute(sql, slugsToInclude) as any[];
            console.error(`Found ${products.length} products.`);
            products.forEach((p: any) => console.error(`- ${p.name} (${p.category_path})`));

        } else {
            console.error(`Category '${category}' not found or inactive.`);
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
