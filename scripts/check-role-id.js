
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkRoleId() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const roleId = '3c34b622-2285-4722-8604-ea2f2606bf0c';

        console.log(`Checking Role ID: ${roleId}`);
        const [rows] = await connection.execute('SELECT id, name, slug FROM roles WHERE id = ?', [roleId]);

        if (rows.length > 0) {
            console.log(`FOUND: ${rows[0].slug} (${rows[0].name})`);
        } else {
            console.log('NOT FOUND');
        }
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkRoleId();
