
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugUserAndRoles() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        // Search by username OR role_id to be thorough
        console.log('--- Checking for users like EMP-0008 ---');
        const [users] = await connection.execute(
            `SELECT * FROM users WHERE username LIKE '%EMP-0008%'`
        );

        console.log(JSON.stringify(users, null, 2));

        if (users.length > 0) {
            const user = users[0];
            if (user.role_id) {
                console.log(`\n--- Checking Role ID: ${user.role_id} ---`);
                const [roles] = await connection.execute(
                    `SELECT * FROM roles WHERE id = ?`,
                    [user.role_id]
                );
                console.log(JSON.stringify(roles, null, 2));
            } else {
                console.log('\n--- User has NULL role_id ---');
            }
        } else {
            console.log('\n--- User EMP-0008 NOT FOUND ---');
        }

        console.log('\n--- All Roles ---');
        const [allRoles] = await connection.execute(`SELECT id, name, slug FROM roles`);
        console.log(JSON.stringify(allRoles, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugUserAndRoles();
