
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function showColumns() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        const [cols] = await connection.execute(`SHOW COLUMNS FROM permissions`);
        console.log('Permissions columns:');
        cols.forEach(c => console.log(`  ${c.Field}`));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

showColumns();
