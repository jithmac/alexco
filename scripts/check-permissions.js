
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkPermissions() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- SCHEMA: permissions ---');
        const [permCols] = await connection.execute(`DESCRIBE permissions`);
        permCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

        console.log('\n--- SCHEMA: role_permissions ---');
        const [rpCols] = await connection.execute(`DESCRIBE role_permissions`);
        rpCols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));

        console.log('\n--- CUSTOM1 ROLE INFO ---');
        const [roles] = await connection.execute(`SELECT id, slug FROM roles WHERE slug = 'custom1'`);
        console.log('Role:', JSON.stringify(roles[0]));

        if (roles.length > 0) {
            console.log('\n--- PERMISSIONS FOR CUSTOM1 ---');
            const [perms] = await connection.execute(`
                SELECT p.code, p.slug
                FROM role_permissions rp
                JOIN permissions p ON rp.permission_id = p.id
                WHERE rp.role_id = ?
            `, [roles[0].id]);
            console.log('Permissions:', perms.map(p => p.code || p.slug).join(', '));
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkPermissions();
