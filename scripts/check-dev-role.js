
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkDeveloperRole() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- Checking for Developer Role ---');
        const [roles] = await connection.execute(
            `SELECT id, name, slug FROM roles WHERE name LIKE '%Dev%' OR slug LIKE '%dev%'`
        );

        if (roles.length > 0) {
            console.log('Developer Role FOUND:');
            console.log(JSON.stringify(roles, null, 2));
        } else {
            console.log('Developer Role NOT FOUND in database.');
        }
        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkDeveloperRole();
