
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.log("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");
        console.log("Connected.");

        const q = async (sql: string, params: any[] = []) => {
            if (!connection) throw new Error("No connection");
            const [rows] = await connection.execute(sql, params);
            return rows as any[];
        };

        const category = 'solar'; // Test case

        // implementation from filters.ts
        console.log("Fetching all categories...");
        const allCats = await q('SELECT id, parent_id, slug, is_active FROM categories');
        console.log(`Found ${allCats.length} categories.`);

        const targetCat = allCats.find((c: any) => c.slug === category);

        if (targetCat) {
            console.log(`Target Category Found: ${targetCat.slug} (ID: ${targetCat.id}, Active: ${targetCat.is_active})`);
            const slugsToInclude = [category];

            // Find all descendants recursively
            const findDescendants = (parentId: string) => {
                const children = allCats.filter((c: any) => c.parent_id === parentId);
                children.forEach((child: any) => {
                    console.log(`- Found child: ${child.slug}`);
                    slugsToInclude.push(child.slug);
                    findDescendants(child.id);
                });
            };

            findDescendants(targetCat.id);
            console.log("Slugs to include:", slugsToInclude);

            // Simulate query
            const placeholders = slugsToInclude.map(() => '?').join(',');
            const sql = `SELECT name, category_path FROM products WHERE category_path IN (${placeholders})`;

            console.log("Executing SQL:", sql);
            const products = await q(sql, slugsToInclude);

            console.log("Products Found:");
            products.forEach((p: any) => console.log(`- ${p.name} (${p.category_path})`));

        } else {
            console.log(`Category '${category}' not found.`);
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
