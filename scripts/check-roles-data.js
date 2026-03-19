require('dotenv').config();
const mysql = require('mysql2/promise');

async function checkRoles() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('--- AVAILABLE ROLES ---');
        const [roles] = await connection.execute('SELECT id, name, slug FROM roles');
        console.table(roles);

        console.log('\n--- EMPLOYEES ROLES ---');
        const [employees] = await connection.execute('SELECT id, full_name, role FROM employees LIMIT 10');
        console.table(employees);

        console.log('\n--- CURRENT USER PERMISSIONS ---');
        // Let's check permissions for the logged in user (assuming first user found)
        const [users] = await connection.execute('SELECT id, full_name, role_id FROM users LIMIT 1');
        if (users.length > 0) {
            const user = users[0];
            console.log(`Checking permissions for: ${user.full_name} (${user.id})`);

            const [rolePerms] = await connection.execute(`
                SELECT p.slug 
                FROM role_permissions rp 
                JOIN permissions p ON rp.permission_id = p.id 
                WHERE rp.role_id = ?
            `, [user.role_id]);

            console.log('Permissions:', rolePerms.map(p => p.slug));
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

checkRoles();
