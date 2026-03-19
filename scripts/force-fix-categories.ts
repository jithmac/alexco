
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.error("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");

        // 1. Force Fix 'Solar' Parent
        console.error("Fixing Solar Parent...");
        // Ensure it exists with known ID
        await connection.execute(`
            INSERT INTO categories (id, name, slug, is_active, order_index)
            VALUES ('cat-solar', 'Solar & Power', 'solar', 1, 1)
            ON DUPLICATE KEY UPDATE 
                slug = 'solar',
                is_active = 1
        `);

        // 2. Force Fix 'Electrical' Parent
        console.error("Fixing Electrical Parent...");
        await connection.execute(`
            INSERT INTO categories (id, name, slug, is_active, order_index)
            VALUES ('cat-electrical', 'Electrical', 'electrical', 1, 2)
            ON DUPLICATE KEY UPDATE 
                slug = 'electrical',
                is_active = 1
        `);

        // 3. Force Fix Subcategories
        const subs = [
            { id: 'sub-solar-panels', name: 'Solar Panels', slug: 'solar-panels', parent: 'cat-solar' },
            { id: 'sub-inverters', name: 'Inverters', slug: 'inverters', parent: 'cat-solar' },
            { id: 'sub-batteries', name: 'Batteries', slug: 'batteries', parent: 'cat-solar' },
            { id: 'sub-solar-access', name: 'Solar Accessories', slug: 'solar-accessories', parent: 'cat-solar' },
            { id: 'sub-switches', name: 'Switches & Sockets', slug: 'switches-sockets', parent: 'cat-electrical' }
        ];

        console.error("Fixing Subcategories...");
        for (const s of subs) {
            await connection.execute(`
                INSERT INTO categories (id, name, slug, parent_id, is_active)
                VALUES (?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE 
                    parent_id = VALUES(parent_id),
                    slug = VALUES(slug),
                    is_active = 1
            `, [s.id, s.name, s.slug, s.parent]);
        }

        console.error("Done. Categories forced to known state.");

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
