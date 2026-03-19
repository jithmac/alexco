
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function listAllPermissions() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        const [perms] = await connection.execute(`
            SELECT id, code, description, group_name 
            FROM permissions 
            ORDER BY group_name, code
        `);

        console.log('Total Permissions:', perms.length);
        console.log('----------------------------------------');

        // Group by group_name
        const grouped = {};
        perms.forEach(p => {
            if (!grouped[p.group_name]) grouped[p.group_name] = [];
            grouped[p.group_name].push(p);
        });

        for (const [group, items] of Object.entries(grouped)) {
            console.log(`\n[${group}]`);
            items.forEach(p => {
                console.log(`  - ${p.code}: ${p.description}`);
            });
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

listAllPermissions();
