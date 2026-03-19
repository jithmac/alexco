
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function fixUserRole() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- FINDING CORRECT ROLE ID ---');
        // Find role by slug 'technician' or similar. Let's list all first.
        const [roles] = await connection.execute(`SELECT id, name, slug FROM roles`);

        let technicianRole = roles.find(r => r.slug === 'technician');
        if (!technicianRole) {
            console.log('Technician role not found by slug. Checking names...');
            technicianRole = roles.find(r => r.name.toLowerCase().includes('technician'));
        }

        if (technicianRole) {
            console.log(`Found Technician Role: ${technicianRole.name} (ID: ${technicianRole.id})`);

            console.log('--- UPDATING USER ---');
            const [updateResult] = await connection.execute(
                `UPDATE users SET role_id = ? WHERE username LIKE '%EMP-0008%'`,
                [technicianRole.id]
            );
            console.log('Update result:', updateResult);

            console.log('--- VERIFYING ---');
            const [users] = await connection.execute(
                `SELECT username, role_id FROM users WHERE username LIKE '%EMP-0008%'`
            );
            console.log(`User ${users[0].username} now has role_id: ${users[0].role_id}`);

        } else {
            console.log('CRITICAL: Could not find a technician role to assign!');
            console.table(roles);
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

fixUserRole();
