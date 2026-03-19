
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function listRoles() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const [roles] = await connection.execute(`SELECT id, name, slug FROM roles`);
        console.log('All roles:');
        roles.forEach(r => console.log(`  ${r.slug} -> ${r.name}`));
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

listRoles();
