const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found in .env.local");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(connectionString + '?multipleStatements=true');
        console.log("Connected to database.");

        const sqlPath = path.join(__dirname, '../database/migrations/001_create_categories.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Running migration...");
        await connection.query(sql);
        console.log("✅ Categories table created and seeded successfully.");

        await connection.end();
    } catch (e) {
        console.error("Error running migration:", e);
    }
}

runMigration();
