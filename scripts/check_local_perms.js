require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function main() {
    const c = await mysql.createConnection(process.env.DATABASE_URL);

    // Check super_user permissions
    const [perms] = await c.execute(
        `SELECT r.slug as role_slug, p.id as permission 
         FROM role_permissions rp 
         JOIN roles r ON rp.role_id = r.id 
         JOIN permissions p ON rp.permission_id = p.id 
         WHERE r.slug = 'super_user' 
         ORDER BY p.id`
    );
    console.log('Super User Permissions:');
    console.table(perms);

    // Check users
    const [users] = await c.execute('SELECT id, username, role_id FROM users');
    console.log('Users:');
    console.table(users);

    // Check roles
    const [roles] = await c.execute('SELECT id, name, slug FROM roles');
    console.log('Roles:');
    console.table(roles);

    await c.end();
}

main().catch(e => console.error(e));
