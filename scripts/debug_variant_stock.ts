
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
    console.log("Connecting to DB...", process.env.DATABASE_URL?.substring(0, 20) + "...");
    const connection = await mysql.createConnection(process.env.DATABASE_URL as string);
    const [rows] = await connection.execute('SELECT id, name, variations FROM products WHERE variations IS NOT NULL LIMIT 1') as any[];

    if (rows.length === 0) {
        console.log("No products with variations found.");
        return;
    }

    const product = rows[0];
    console.log("Testing with Product:", product.name, product.id);
    console.log("Variations:", product.variations);

    // Pick a test variant ID
    let variantId = "Test:Variant";
    try {
        const vars = typeof product.variations === 'string' ? JSON.parse(product.variations) : product.variations;
        const keys = Object.keys(vars);
        if (keys.length > 0) {
            // Construct a real looking variant ID: "Color:Red;Size:S"
            // Just take first value of first key
            variantId = `${keys[0]}:${vars[keys[0]][0]}`;
        }
    } catch (e) { }

    console.log("Target Variant ID:", variantId);

    // 1. Get current stock
    const [stockBefore] = await connection.execute(
        'SELECT SUM(delta) as stock FROM inventory_ledger WHERE product_id = ? AND variant_id = ?',
        [product.id, variantId]
    ) as any[];
    console.log("Stock Before:", stockBefore[0].stock);

    // 2. Insert adjust
    const [locations] = await connection.execute('SELECT id FROM locations LIMIT 1') as any[];
    const locId = locations[0].id;

    await connection.execute(`
        INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc, variant_id)
        VALUES (?, ?, ?, ?, ?, 'TEST_DEBUG', ?)
    `, [uuidv4(), product.id, locId, 5, 'DEBUG_ADD', variantId]);

    console.log("Inserted +5 stock");

    // 3. Get new stock
    const [stockAfter] = await connection.execute(
        'SELECT SUM(delta) as stock FROM inventory_ledger WHERE product_id = ? AND variant_id = ?',
        [product.id, variantId]
    ) as any[];
    console.log("Stock After:", stockAfter[0].stock);

    await connection.end();
}

main().catch(console.error);
