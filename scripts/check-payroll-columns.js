const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306
        });

        console.log("Connected to database.");

        const [cols] = await connection.execute('DESCRIBE employees');
        const colNames = cols.map(c => c.Field);

        const payrollCols = ['epf_employee_rate', 'epf_employer_rate', 'etf_employer_rate', 'is_active'];
        console.log("\n--- Employee Table Columns ---");
        payrollCols.forEach(c => {
            if (colNames.includes(c)) {
                console.log(`[OK] Column '${c}' exists.`);
            } else {
                console.error(`[MISSING] Column '${c}' is MISSING!`);
            }
        });

        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM employees');
        console.log(`\nTotal employees in DB: ${rows[0].count}`);

        const [activeRows] = await connection.execute('SELECT COUNT(*) as count FROM employees WHERE is_active = TRUE');
        console.log(`Active employees in DB: ${activeRows[0].count}`);

        connection.end();
    } catch (e) {
        console.error("Error:", e);
    }
}

check();
