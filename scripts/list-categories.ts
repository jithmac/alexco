
import mysql from 'mysql2/promise';

async function listCategories() {
    let connection: mysql.Connection | undefined;
    try {
        console.error("DEBUG: STARTING LIST CATEGORIES");

        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");
        const [rows] = await connection.execute('SELECT slug, id, parent_id FROM categories') as any[];

        if (!rows || rows.length === 0) {
            console.error("DEBUG: NO CATEGORIES FOUND");
        } else {
            console.error(`DEBUG: Found ${rows.length} categories`);
            rows.forEach((r: any) => {
                console.error(`- Slug: ${r.slug} | ID: ${r.id} | Parent: ${r.parent_id}`);
            });
        }
        console.error("DEBUG: FINISHED LIST CATEGORIES");

    } catch (e: any) {
        console.error("DEBUG: ERROR in listCategories:", e.message || e);
    } finally {
        if (connection) await connection.end();
    }
}

listCategories();
