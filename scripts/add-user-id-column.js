
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('Adding user_id column to employees table...');

        // Check if column exists first
        const [rows] = await connection.execute(`SHOW COLUMNS FROM employees LIKE 'user_id'`);
        if (rows.length > 0) {
            console.log('user_id column already exists.');
        } else {
            await connection.execute(`
                ALTER TABLE employees 
                ADD COLUMN user_id CHAR(36) NULL AFTER role,
                ADD INDEX idx_user_id (user_id)
            `);
            console.log('user_id column added successfully.');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

migrate();
