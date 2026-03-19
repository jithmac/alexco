
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function checkCustomRole() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('--- ALL ROLES IN DB ---');
        const [roles] = await connection.execute(`SELECT id, name, slug FROM roles`);
        console.log(JSON.stringify(roles, null, 2));

        console.log('\n--- EMPLOYEE ROLE DATA ---');
        const [employees] = await connection.execute(`SELECT role, user_id FROM employees WHERE employee_number = 'EMP-0008'`);
        console.log(JSON.stringify(employees, null, 2));

        console.log('\n--- USER ROLE DATA ---');
        const [users] = await connection.execute(`
            SELECT u.username, u.role_id, r.slug as role_slug
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.username LIKE '%EMP-0008%'
        `);
        console.log(JSON.stringify(users, null, 2));

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCustomRole();
