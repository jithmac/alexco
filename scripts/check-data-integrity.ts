
import mysql from 'mysql2/promise';
import fs from 'fs';

async function run() {
    let connection: mysql.Connection | undefined;
    const logFile = 'integrity_log.txt';
    const log = (msg: string) => {
        console.error(msg);
        fs.appendFileSync(logFile, msg + '\n');
    };

    fs.writeFileSync(logFile, "Starting Integrity Check\n");

    try {
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");

        if (!connection) throw new Error("No connection");
        // 1. Check Categories for Whitespace/Hidden chars
        log("\n--- Category Slugs (HEX Check) ---");
        const [cats] = await connection.execute("SELECT slug FROM categories WHERE slug LIKE '%solar%'") as any[];
        cats.forEach((c: any) => {
            log(`'${c.slug}' -> HEX: ${Buffer.from(c.slug).toString('hex')}`);
        });

        // 2. Check Product Paths for Whitespace/Hidden chars
        log("\n--- Product Category Paths (HEX Check - Sample) ---");
        const [prods] = await connection.execute("SELECT sku, category_path, inventory_strategy FROM products WHERE category_path LIKE '%solar%' LIMIT 5") as any[];
        prods.forEach((p: any) => {
            log(`SKU: ${p.sku} | Path: '${p.category_path}' -> HEX: ${Buffer.from(p.category_path).toString('hex')} | Strat: ${p.inventory_strategy}`);
        });

        // 3. Check for Exact Match
        log("\n--- Exact Match Test ---");
        const targetSlug = 'solar-panels'; // known from code
        const [match] = await connection.execute("SELECT COUNT(*) as c FROM products WHERE category_path = ?", [targetSlug]) as any[];
        log(`Products matching exact '${targetSlug}': ${match[0].c}`);

    } catch (e: any) {
        log("Error: " + e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
