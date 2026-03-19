
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.error("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");
        console.error("--- PRODUCTS CATEGORY PATHS ---");
        const [rows] = await connection.execute("SELECT sku, name, category_path FROM products ORDER BY category_path") as any[];

        rows.forEach((r: any) => {
            console.error(`${r.sku.padEnd(15)} | ${r.category_path.padEnd(20)} | ${r.name}`);
        });

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
