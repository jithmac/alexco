const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runLocalUpdate() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found in .env.local");
        process.exit(1);
    }

    try {
        const connection = await mysql.createConnection(connectionString + '?multipleStatements=true'); // Enable multiple statements
        console.log("Connected to local database.");

        const sqlPath = path.join(__dirname, '../database/local-update.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("Running update script...");
        await connection.query(sql);
        console.log("✅ Local database updated successfully.");

        await connection.end();
    } catch (e) {
        console.error("Error updating database:", e);
    }
}

runLocalUpdate();
