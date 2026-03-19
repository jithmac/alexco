
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function syncCustomRole() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        // Find custom1 role
        console.log('--- FINDING CUSTOM1 ROLE ---');
        const [roles] = await connection.execute(`SELECT id, name, slug FROM roles WHERE slug = 'custom1' OR name LIKE '%custom1%'`);
        console.log('Custom1 role:', JSON.stringify(roles, null, 2));

        if (roles.length > 0) {
            const roleId = roles[0].id;
            const roleSlug = roles[0].slug;

            // Find employee with custom1 role and their user_id
            console.log('\n--- FINDING EMPLOYEE ---');
            const [employees] = await connection.execute(`SELECT id, user_id, role FROM employees WHERE role = 'custom1'`);
            console.log('Employees:', JSON.stringify(employees, null, 2));

            if (employees.length > 0 && employees[0].user_id) {
                console.log('\n--- SYNCING USER ROLE ---');
                await connection.execute(`UPDATE users SET role_id = ? WHERE id = ?`, [roleId, employees[0].user_id]);
                console.log('SUCCESS: Updated user role_id to', roleId);

                // Also update employee role to use slug
                await connection.execute(`UPDATE employees SET role = ? WHERE id = ?`, [roleSlug, employees[0].id]);
                console.log('SUCCESS: Updated employee role to', roleSlug);
            } else {
                console.log('No employee found with custom1 role or no linked user');
            }
        } else {
            console.log('custom1 role not found');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

syncCustomRole();
