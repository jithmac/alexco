const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function main() {
    console.log('DB_HOST:', process.env.DB_HOST ? 'Defined' : 'Undefined');
    console.log('DB_USER:', process.env.DB_USER ? 'Defined' : 'Undefined');

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306 // Added port which was in the working script
    });

    try {
        console.log('--- Users ---');
        const [users] = await connection.execute('SELECT id, username, full_name, role, employee_id FROM users');
        console.table(users);

        console.log('\n--- Employees ---');
        const [employees] = await connection.execute('SELECT id, full_name, job_title FROM employees');
        console.table(employees);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await connection.end();
    }
}

main();
