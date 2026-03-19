
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugDeveloperRole() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- SEARCHING FOR "developer" ROLE ---');
        const [roles] = await connection.execute(
            `SELECT * FROM roles WHERE slug LIKE '%dev%' OR name LIKE '%dev%'`
        );
        console.table(roles);

        console.log('--- CHECKING EMP-0008 AGAIN ---');
        const [users] = await connection.execute(
            `SELECT username, role_id FROM users WHERE username LIKE '%EMP-0008%'`
        );
        console.log(JSON.stringify(users, null, 2));

        if (users.length > 0 && roles.length > 0) {
            const user = users[0];
            const devRole = roles.find(r => r.name.toLowerCase().includes('dev'));
            if (devRole) {
                if (user.role_id === devRole.id) {
                    console.log('User IS linked to Developer role.');
                } else {
                    console.log(`User is linked to ${user.role_id}, but Developer role is ${devRole.id}`);
                    console.log('MISMATCH DETECTED.');
                }
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugDeveloperRole();
