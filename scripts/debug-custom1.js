
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debugCustom1Access() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        // Get custom1 role
        console.log('--- CUSTOM1 ROLE ---');
        const [roles] = await connection.execute(`SELECT id, name, slug FROM roles WHERE slug = 'custom1'`);
        if (roles.length === 0) {
            console.log('custom1 role NOT FOUND');
            await connection.end();
            return;
        }
        console.log(`ID: ${roles[0].id}, Name: ${roles[0].name}`);

        // Get permissions assigned to custom1
        console.log('\n--- PERMISSIONS FOR CUSTOM1 ---');
        const [perms] = await connection.execute(`
            SELECT p.code, p.description 
            FROM role_permissions rp
            JOIN permissions p ON rp.permission_id = p.id
            WHERE rp.role_id = ?
        `, [roles[0].id]);

        if (perms.length === 0) {
            console.log('NO PERMISSIONS ASSIGNED!');
        } else {
            perms.forEach(p => console.log(`  ${p.code}: ${p.description}`));
        }

        // Check what POS access needs
        console.log('\n--- POS ACCESS PERMISSION ---');
        const [posPerms] = await connection.execute(`SELECT * FROM permissions WHERE code LIKE '%pos%'`);
        posPerms.forEach(p => console.log(`  ${p.code}: ${p.description}`));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

debugCustom1Access();
