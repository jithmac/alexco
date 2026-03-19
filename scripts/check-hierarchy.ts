
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.log("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");

        console.error("--- Categories Table ---");
        const [rows] = await connection.execute('SELECT id, name, slug, parent_id FROM categories ORDER BY slug');

        (rows as any[]).forEach(r => console.error(`${r.slug} | ID: ${r.id} | Parent: ${r.parent_id}`));

        console.error("\n--- Checking Solar Hierarchy ---");
        const solar = (rows as any[]).find(r => r.slug === 'solar');
        if (solar) {
            console.error(`Solar ID: ${solar.id}`);
            const children = (rows as any[]).filter(r => r.parent_id === solar.id);
            console.error(`Children found: ${children.length}`);
            children.forEach(c => console.error(`- ${c.slug} (Parent: ${c.parent_id})`));
        } else {
            console.error("Solar category not found!");
        }

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
