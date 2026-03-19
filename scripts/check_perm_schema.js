require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection(process.env.DATABASE_URL);
    const [cols] = await c.execute('DESCRIBE permissions');
    console.log('Permissions table schema:');
    console.table(cols);

    const [perms] = await c.execute('SELECT id, code, description FROM permissions LIMIT 5');
    console.log('Sample permissions:');
    console.table(perms);

    await c.end();
}

main().catch(e => console.error(e));
