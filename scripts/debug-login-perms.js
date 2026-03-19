
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugLogin() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const username = 'EMP-0008';

        console.log('--- SIMULATING LOGIN ---');

        // Step 1: Get user with role
        const [users] = await connection.execute(`
            SELECT u.id, u.username, u.role_id, COALESCE(r.slug, u.role) as role
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.username = ?
        `, [username]);

        if (users.length === 0) {
            console.log('User not found!');
            return;
        }

        console.log('User:', users[0].username);
        console.log('Role:', users[0].role);
        console.log('Role ID:', users[0].role_id);

        // Step 2: Get permissions for this role_id
        console.log('\n--- FETCHING PERMISSIONS ---');
        const [permissions] = await connection.execute(`
            SELECT p.code 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ?
        `, [users[0].role_id]);

        console.log('Permissions:', permissions.map(p => p.code));

        // Step 3: Check if pos.access is there
        const hasPosAccess = permissions.some(p => p.code === 'pos.access');
        console.log('\nHas pos.access:', hasPosAccess);

        if (hasPosAccess) {
            console.log('✓ User should be redirected to /paths/POS');
        } else {
            console.log('✗ User does NOT have pos.access');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugLogin();
