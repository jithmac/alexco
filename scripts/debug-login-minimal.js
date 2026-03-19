
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugUserAndRoles() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- FINDING USER ---');
        const [users] = await connection.execute(
            `SELECT username, role_id FROM users WHERE username LIKE '%EMP-0008%'`
        );

        if (users.length > 0) {
            console.log(`User: ${users[0].username}`);
            console.log(`Role_ID: ${users[0].role_id}`);

            console.log('--- ROLES LIST ---');
            const [roles] = await connection.execute(`SELECT id, slug FROM roles`);
            roles.forEach(r => {
                console.log(`${r.id} : ${r.slug}`);
            });

            // Check match in JS
            const match = roles.find(r => r.id === users[0].role_id);
            console.log('--- MATCH RESULT ---');
            if (match) {
                console.log(`MATCH FOUND: ${match.slug}`);
            } else {
                console.log('NO MATCH FOUND IN JS');
            }

        } else {
            console.log('User not found');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugUserAndRoles();
