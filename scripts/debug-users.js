
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function inspectUsers() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- Start Users Dump ---');
        const [rows] = await connection.execute(`SELECT username, role, role_id FROM users ORDER BY created_at DESC LIMIT 5`);

        console.log(JSON.stringify(rows, null, 2));
        console.log('--- End Users Dump ---');

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectUsers();
