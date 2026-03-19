
const mysql = require('mysql2/promise');

async function cleanDatabase() {
    // VPS Connection Details
    const config = {
        host: 'monetize.lk', // Resolves to the VPS IP
        user: 'alexco_user',
        password: 'Ican123ZXC++',
        database: 'alexco_db',
        port: 3306
    };

    console.log("Connecting to VPS Database at monetize.lk...");

    let connection;
    try {
        connection = await mysql.createConnection(config);
        console.log("Connected successfully!");

        // 1. Disable Foreign Key Checks for bulk cleaning
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');

        const tablesToClear = [
            'inventory_ledger',
            'sales_items',
            'sales_orders',
            'ticket_items',
            'tickets',
            'job_vacancies',
            'employees',
            'products',
            'categories',
            'delivery_rates',
            'ticket_sequences',
            'ticket_history'
        ];

        for (const table of tablesToClear) {
            console.log(`Clearing table: ${table}...`);
            await connection.query(`TRUNCATE TABLE ${table}`);
        }

        // 2. Clean Users (preserve super_user and admin)
        console.log("Cleaning non-admin users...");
        const [result] = await connection.query(
            "DELETE FROM users WHERE role NOT IN ('super_user', 'admin', 'ecommerce_admin', 'repair_admin')"
        );
        console.log(`Deleted ${result.affectedRows} non-admin users.`);

        // 3. Re-enable Foreign Key Checks
        await connection.query('SET FOREIGN_KEY_CHECKS = 1');

        console.log("\n--- Cleanup Complete ---");

        // Verify remaining users
        const [users] = await connection.query("SELECT username, role FROM users");
        console.log("Remaining Users:");
        console.table(users);

    } catch (error) {
        console.error("Cleanup Failed:", error.message);
        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.error("\nTIP: Remote connection to 'monetize.lk' might be blocked by a firewall.");
            console.error("You may need to run this script directly ON the VPS terminal.");
        }
    } finally {
        if (connection) await connection.end();
    }
}

cleanDatabase();
