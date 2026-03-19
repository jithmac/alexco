
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkUserRole() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- CHECK USER ROLE DATA ---');
        const [rows] = await connection.execute(`
            SELECT u.username, u.role_id, r.name as role_name, r.slug as role_slug
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.username LIKE '%EMP-0008%'
        `);
        console.log(JSON.stringify(rows, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUserRole();
