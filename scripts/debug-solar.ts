
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");

        console.error("--- COUNTING ALL CATEGORIES ---");
        const [count] = await connection.execute("SELECT COUNT(*) as c FROM categories") as any[];
        console.error(`Total Categories: ${count[0].c}`);

        console.error("--- SEARCHING 'solar' ---");
        const [rows] = await connection.execute("SELECT id, slug, parent_id FROM categories WHERE slug LIKE '%solar%'") as any[];

        if (rows.length === 0) {
            console.error("No categories found matching '%solar%'.");
        } else {
            rows.forEach((r: any) => {
                console.error(`Slug: ${r.slug} | ID: ${r.id} | Parent: ${r.parent_id}`);
            });
        }

        console.error("--- SEARCHING 'electrical' ---");
        const [elec] = await connection.execute("SELECT id, slug, parent_id FROM categories WHERE slug LIKE '%electrical%'") as any[];
        elec.forEach((r: any) => {
            console.error(`Slug: ${r.slug} | ID: ${r.id} | Parent: ${r.parent_id}`);
        });

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
