const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        console.log("Connected to database.");

        // Check if column exists
        const [columns] = await connection.execute("SHOW COLUMNS FROM categories LIKE 'image'");
        if (columns.length > 0) {
            console.log("Column 'image' already exists in 'categories'.");
        } else {
            console.log("Adding 'image' column to 'categories' table...");
            await connection.execute("ALTER TABLE categories ADD COLUMN image TEXT");
            console.log("Column 'image' added successfully.");
        }

        await connection.end();
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

main();
