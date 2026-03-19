
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkSchema() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    console.log("Connected to database...");

    const expectedTables = [
        'products', 'locations', 'inventory_ledger', 'delivery_rates',
        'sales_orders', 'sales_items', 'tickets', 'ticket_items',
        'employees', 'users', 'roles', 'permissions', 'categories', 'job_vacancies'
    ];

    const [rows] = await connection.execute('SHOW TABLES');
    const existingTables = rows.map(r => Object.values(r)[0]);

    console.log("\n--- Table Existence Check ---");
    expectedTables.forEach(table => {
        if (!existingTables.includes(table)) {
            console.error(`[MISSING TABLE] ${table}`);
        } else {
            console.log(`[OK] ${table}`);
        }
    });

    console.log("\n--- Column Check (Critical Tables) ---");

    // Check sales_orders columns
    if (existingTables.includes('sales_orders')) {
        const [cols] = await connection.execute('DESCRIBE sales_orders');
        const colNames = cols.map(c => c.Field);
        const required = ['customer_name', 'customer_phone', 'customer_email', 'shipping_address', 'order_source', 'delivery_status', 'payment_proof'];

        console.log(`\nChecking sales_orders...`);
        required.forEach(c => {
            if (!colNames.includes(c)) console.error(`[MISSING COLUMN] sales_orders.${c}`);
            else console.log(`[OK] sales_orders.${c}`);
        });
    }

    // Check sales_items columns
    if (existingTables.includes('sales_items')) {
        const [cols] = await connection.execute('DESCRIBE sales_items');
        const colNames = cols.map(c => c.Field);
        if (!colNames.includes('variant_options')) console.error(`[MISSING COLUMN] sales_items.variant_options`);
        else console.log(`[OK] sales_items.variant_options`);
    }

    // Check products columns
    if (existingTables.includes('products')) {
        const [cols] = await connection.execute('DESCRIBE products');
        const colNames = cols.map(c => c.Field);
        const required = ['gallery', 'specifications', 'whats_included', 'features'];

        console.log(`\nChecking products...`);
        required.forEach(c => {
            if (!colNames.includes(c)) console.error(`[MISSING COLUMN] products.${c}`);
        });
    }

    // Check Roles & Permissions
    console.log("\n--- Roles & Permissions Diagnostics ---");

    // 1. Roles
    const [roles] = await connection.execute('SELECT * FROM roles');
    console.table(roles);

    // 2. Permissions
    const [permissions] = await connection.execute('SELECT * FROM permissions');
    console.table(permissions);

    // 3. Role Permissions
    const [rolePerms] = await connection.execute(`
        SELECT r.name as Role, p.id as Permission 
        FROM role_permissions rp 
        JOIN roles r ON rp.role_id = r.id 
        JOIN permissions p ON rp.permission_id = p.id
    `);
    console.table(rolePerms);

    connection.end();
}

checkSchema();
