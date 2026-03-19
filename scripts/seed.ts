import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// 1. Load Environment Variables BEFORE importing db
dotenv.config({ path: '.env.local' });

// Define data first
const SEED_PRODUCTS = [
    {
        sku: 'SOL-JK-450',
        name: 'Jinko Solar Tiger Neo 54HL4-B 450W',
        category: 'Solar Panels',
        price: 45000,
        specs: JSON.stringify({ Wattage: "450W", Type: "N-type Mono" })
    },
    {
        sku: 'INV-HU-5K',
        name: 'Huawei SUN2000-5KTL-L1 Inverter',
        category: 'Inverters',
        price: 285000,
        specs: JSON.stringify({ Power: "5kW", Phase: "Single" })
    },
    {
        sku: 'ELE-OR-13A',
        name: 'Orange Electric 13A Socket',
        category: 'Electrical',
        price: 850,
        specs: JSON.stringify({ Amps: "13A", Color: "White" })
    }
];

async function seed() {
    console.log('🔄 Loading Database Module...');
    // 2. Dynamic Import
    const { pool } = await import('../lib/db');

    console.log('🌱 Starting Seed (MySQL)...');
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Check if Tables Exist (Simple check)
        const [tables] = await connection.query(`SHOW TABLES LIKE 'products'`);
        if ((tables as any[]).length === 0) {
            console.log('⚠️ Tables not found. Running Schema...');
            const schemaPath = path.join(process.cwd(), 'database/schema.sql');
            const schemaSql = fs.readFileSync(schemaPath, 'utf8');

            const statements = schemaSql
                .split(';')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            for (const stmt of statements) {
                await connection.query(stmt);
            }
            console.log('✅ Schema Created.');
        }

        // 2. Insert Products
        console.log('📦 Seeding Products...');
        for (const p of SEED_PRODUCTS) {
            const [exists] = await connection.query('SELECT id FROM products WHERE sku = ?', [p.sku]);
            let productId;

            if ((exists as any[]).length === 0) {
                productId = uuidv4();
                await connection.query(
                    `INSERT INTO products (id, sku, name, category_path, price_retail, tax_code, specifications)
                  VALUES (?, ?, ?, ?, ?, 'VAT_18', ?)`,
                    [productId, p.sku, p.name, p.category, p.price, p.specs]
                );
                console.log(`   + Added: ${p.name}`);
            } else {
                productId = (exists as any[])[0].id;
                console.log(`   . Skipped: ${p.name} (Exists)`);
            }

            // 3. Initial Inventory (Store Location)
            let locId;
            const [locRes] = await connection.query("SELECT id FROM locations WHERE name = 'Main Store' LIMIT 1");
            if ((locRes as any[]).length === 0) {
                locId = uuidv4();
                await connection.query("INSERT INTO locations (id, name, type) VALUES (?, 'Main Store', 'Store')", [locId]);
            } else {
                locId = (locRes as any[])[0].id;
            }

            // Check if inventory exists
            const [ledgerRes] = await connection.query('SELECT 1 FROM inventory_ledger WHERE product_id = ? LIMIT 1', [productId]);
            if ((ledgerRes as any[]).length === 0) {
                const transId = uuidv4();
                await connection.query(
                    `INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code)
                  VALUES (?, ?, ?, 50, 'RESTOCK')`,
                    [transId, productId, locId]
                );
                console.log(`   + Added 50 Stock`);
            }
        }

        await connection.commit();
        console.log('✅ Seeding Complete!');

    } catch (err) {
        await connection.rollback();
        console.error('❌ Seeding Failed:', err);
    } finally {
        connection.release();
        process.exit();
    }
}

seed();
