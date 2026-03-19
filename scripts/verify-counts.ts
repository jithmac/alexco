
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.error("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        // 1. Get current implementation counts (Simulate getCategories SQL)
        console.error("\n--- Current SQL Implementation (LIKE %slug%) ---");
        if (!connection) throw new Error("No connection");
        const [currentCounts] = await connection.execute(`
            SELECT c.name, c.slug, 
            (SELECT COUNT(*) FROM products p WHERE p.category_path LIKE CONCAT('%', c.slug, '%')) as count
            FROM categories c
            WHERE c.parent_id IS NULL
        `) as any[];
        console.table(currentCounts);

        // 2. Calculate Actual Correct Counts (Aggregation)
        console.error("\n--- Correct Counts (Recursive Aggregation) ---");

        // Get all active categories
        const [allCats] = await connection.execute("SELECT id, name, slug, parent_id FROM categories WHERE is_active=1") as any[];

        // Get all product counts grouped by category_path (slug)
        const [prodCounts] = await connection.execute("SELECT category_path, COUNT(*) as c FROM products GROUP BY category_path") as any[];
        const prodCountMap: Record<string, number> = {};
        prodCounts.forEach((r: any) => prodCountMap[r.category_path] = r.c);

        // Helper to get all descendant slugs for a category
        const getDescendants = (parentId: string): string[] => {
            const children = allCats.filter((c: any) => c.parent_id === parentId);
            let slugs = children.map((c: any) => c.slug);
            for (const child of children) {
                slugs = [...slugs, ...getDescendants(child.id)];
            }
            return slugs;
        };

        const results = [];
        const topLevel = allCats.filter((c: any) => !c.parent_id);

        for (const cat of topLevel) {
            const selfSlug = cat.slug;
            const descendantSlugs = getDescendants(cat.id);
            const allSlugs = [selfSlug, ...descendantSlugs];

            let total = 0;
            allSlugs.forEach(slug => {
                total += (prodCountMap[slug] || 0);
            });

            results.push({
                Category: cat.name,
                Slug: selfSlug,
                Actual: total,
                Current: currentCounts.find((c: any) => c.slug === cat.slug)?.count
            });
        }

        console.error("\n--- RESULTS ---");
        results.forEach(r => {
            console.error(`Category: ${r.Category} (${r.Slug})`);
            console.error(`  - Actual Count: ${r.Actual}`);
            console.error(`  - Current Impl: ${r.Current}`);
            console.error(`  - Diff: ${r.Actual - r.Current}`);
        });

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
