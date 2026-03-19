
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addPermissions() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        const newPermissions = [
            { code: 'reports.view', name: 'View Reports Hub', description: 'Access to the Reports Hub dashboard', group_name: 'Admin' },
            { code: 'payroll.view', name: 'View Payroll Summary', description: 'View monthly payroll summary and stats', group_name: 'HR' },
            { code: 'payroll.manage', name: 'Manage Payroll', description: 'Generate and download payroll reports and bank files', group_name: 'HR' },
            { code: 'inventory.categories', name: 'Manage Categories', description: 'Add, edit, or delete inventory categories', group_name: 'Inventory' },
            { code: 'admin.settings', name: 'Manage System Settings', description: 'Access to system and delivery configuration', group_name: 'Admin' },
            { code: 'pos.reports', name: 'POS Sales Reports', description: 'Access to POS-specific sales reports and analytics', group_name: 'POS' }
        ];

        console.log('--- ADDING NEW PERMISSIONS ---');

        for (const perm of newPermissions) {
            // Check if exists
            const [rows] = await connection.execute('SELECT id FROM permissions WHERE code = ?', [perm.code]);
            if (rows.length === 0) {
                const id = require('crypto').randomUUID();
                await connection.execute(
                    'INSERT INTO permissions (id, code, description, group_name) VALUES (?, ?, ?, ?)',
                    [id, perm.code, perm.description, perm.group_name]
                );
                console.log(`Added: ${perm.code}`);
            } else {
                console.log(`Exists: ${perm.code}`);
            }
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

addPermissions();
