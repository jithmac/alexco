const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

// Try loading env files
const envPathLocal = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');

if (fs.existsSync(envPathLocal)) {
    require('dotenv').config({ path: envPathLocal });
    console.log("Loaded .env.local");
} else if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log("Loaded .env");
} else {
    console.log("No .env file found!");
}

async function migrate() {
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_USER:", process.env.DB_USER);
    // console.log("DB_PASSWORD:", process.env.DB_PASSWORD); // Don't log password

    try {
        console.log("Connecting to database...");
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'alexco_db',
            port: process.env.DB_PORT || 3306
        });

        console.log("Connected! Adding columns...");

        const columns = [
            "ADD COLUMN IF NOT EXISTS epf_employee_rate DECIMAL(5, 4) DEFAULT 0.0800",
            "ADD COLUMN IF NOT EXISTS epf_employer_rate DECIMAL(5, 4) DEFAULT 0.1200",
            "ADD COLUMN IF NOT EXISTS etf_employer_rate DECIMAL(5, 4) DEFAULT 0.0300"
        ];

        try {
            await connection.query(`
                ALTER TABLE employees 
                ADD COLUMN IF NOT EXISTS epf_employee_rate DECIMAL(5, 4) DEFAULT 0.0800,
                ADD COLUMN IF NOT EXISTS epf_employer_rate DECIMAL(5, 4) DEFAULT 0.1200,
                ADD COLUMN IF NOT EXISTS etf_employer_rate DECIMAL(5, 4) DEFAULT 0.0300
            `);
            console.log("Columns added successfully.");
        } catch (e) {
            console.log("Bulk add failed, trying individually...");
            for (const col of columns) {
                try {
                    await connection.query(`ALTER TABLE employees ${col}`);
                    console.log(`Executed: ${col}`);
                } catch (err) {
                    console.log(`Error adding column: ${err.message}`);
                }
            }
        }

        await connection.end();
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error.message);
        process.exit(1);
    }
}

migrate();
