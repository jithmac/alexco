
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function inspectSchema() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- permissions table ---');
        const [permCols] = await connection.execute(`DESCRIBE permissions`);
        permCols.forEach(c => console.log(`  ${c.Field}`));

        console.log('\n--- role_permissions table ---');
        const [rpCols] = await connection.execute(`DESCRIBE role_permissions`);
        rpCols.forEach(c => console.log(`  ${c.Field}`));

        console.log('\n--- Sample permissions data ---');
        const [perms] = await connection.execute(`SELECT * FROM permissions LIMIT 3`);
        console.log(JSON.stringify(perms, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectSchema();
