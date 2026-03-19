
const { adjustStock, getVariantStock, createProduct } = require('../server-actions/admin/inventory');
const { query } = require('../lib/db');

// Mock next/cache
jest.mock('next/cache', () => ({
    revalidatePath: jest.fn(),
}));

// Mock auth
jest.mock('../lib/auth', () => ({
    requirePermission: jest.fn().mockResolvedValue(true),
}));

// We can't easily use Jest mocks in a standalone script without Jest.
// Let's make a standalone script that imports the built files or uses ts-node if available.
// Since we are continuously running `npm run dev`, we might not be able to easily run TS files directly without ts-node.
// Let's create a JS script that connects to DB directly to simulate the flow, 
// OR try to call the server action if we can setup the environment.
// Actually, simplest is to use the `query` function from `lib/db` if we can require it.
// But `lib/db` is TS.
// Let's create a JS script `scripts/debug_variant_stock.js` which uses `mysql2` directly to test the data layer.

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    const [rows] = await connection.execute('SELECT id, name, variations FROM products WHERE variations IS NOT NULL LIMIT 1');

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
            variantId = `${keys[0]}:${vars[keys[0]][0]}`;
        }
    } catch (e) { }

    console.log("Target Variant ID:", variantId);

    // 1. Get current stock
    const [stockBefore] = await connection.execute(
        'SELECT SUM(delta) as stock FROM inventory_ledger WHERE product_id = ? AND variant_id = ?',
        [product.id, variantId]
    );
    console.log("Stock Before:", stockBefore[0].stock);

    // 2. Insert adjust
    const { v4: uuidv4 } = require('uuid');
    const locations = await connection.execute('SELECT id FROM locations LIMIT 1');
    const locId = locations[0][0].id;

    await connection.execute(`
        INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc, variant_id)
        VALUES (?, ?, ?, ?, ?, 'TEST_DEBUG', ?)
    `, [uuidv4(), product.id, locId, 5, 'DEBUG_ADD', variantId]);

    console.log("Inserted +5 stock");

    // 3. Get new stock
    const [stockAfter] = await connection.execute(
        'SELECT SUM(delta) as stock FROM inventory_ledger WHERE product_id = ? AND variant_id = ?',
        [product.id, variantId]
    );
    console.log("Stock After:", stockAfter[0].stock);

    await connection.end();
}

main().catch(console.error);
