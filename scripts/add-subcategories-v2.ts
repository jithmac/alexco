
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

        // 1. Ensure Parents Exist
        console.log("Checking parents...");

        let solarId = 'cat-solar';
        const solarRows = await q("SELECT id FROM categories WHERE slug='solar'");
        if (solarRows.length > 0) {
            solarId = solarRows[0].id;
            console.log(`Found Solar parent: ${solarId}`);
        } else {
            console.log("Creating Solar parent...");
            await q("INSERT IGNORE INTO categories (id, name, slug, is_active) VALUES (?, ?, ?, 1)", [solarId, 'Solar & Power', 'solar']);
        }

        let elecId = 'cat-electrical';
        const elecRows = await q("SELECT id FROM categories WHERE slug='electrical'");
        if (elecRows.length > 0) {
            elecId = elecRows[0].id;
            console.log(`Found Electrical parent: ${elecId}`);
        } else {
            console.log("Creating Electrical parent...");
            await q("INSERT IGNORE INTO categories (id, name, slug, is_active) VALUES (?, ?, ?, 1)", [elecId, 'Electrical', 'electrical']);
        }

        // 2. Insert Subcategories
        const subs = [
            { id: 'sub-solar-panels', name: 'Solar Panels', slug: 'solar-panels', parent: solarId },
            { id: 'sub-inverters', name: 'Inverters', slug: 'inverters', parent: solarId },
            { id: 'sub-batteries', name: 'Batteries', slug: 'batteries', parent: solarId },
            { id: 'sub-solar-access', name: 'Solar Accessories', slug: 'solar-accessories', parent: solarId },
            { id: 'sub-switches', name: 'Switches & Sockets', slug: 'switches-sockets', parent: elecId },
        ];

        console.log("Inserting subcategories...");
        for (const s of subs) {
            console.log(`- ${s.slug} -> Parent: ${s.parent}`);
            await q(`
                INSERT INTO categories (id, name, slug, parent_id, is_active)
                VALUES (?, ?, ?, ?, 1)
                ON DUPLICATE KEY UPDATE parent_id = VALUES(parent_id), name = VALUES(name)
            `, [s.id, s.name, s.slug, s.parent]);
        }

        console.log("Done.");

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
