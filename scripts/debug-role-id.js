
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugRoleById() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        const roleId = '3c34b622-2285-4722-8604-ea2f2606bf0c';

        console.log(`--- LOOKING UP ROLE ID: ${roleId} ---`);
        const [roles] = await connection.execute(
            `SELECT * FROM roles WHERE id = ?`,
            [roleId]
        );

        if (roles.length > 0) {
            console.log('ROLE FOUND:', JSON.stringify(roles[0], null, 2));
        } else {
            console.log('ROLE NOT FOUND in DB!');

            // List all roles just in case
            console.log('--- ALL ROLES ---');
            const [allRoles] = await connection.execute(`SELECT id, name, slug FROM roles`);
            console.log(JSON.stringify(allRoles, null, 2));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugRoleById();
