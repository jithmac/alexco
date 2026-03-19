
const mysql = require('mysql2/promise');

async function checkEmployees() {
    try {
        console.log('Connecting to database...');
        const connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: 'Ican123ZXC',
            database: 'alexco_db'
        });

        console.log('Checking employees table...');
        const [rows] = await connection.execute(`
            SELECT id, full_name, employee_number, role, user_id 
            FROM employees
        `);

        console.log(`Found ${rows.length} employees.`);
        rows.forEach(emp => {
            console.log(`${emp.employee_number} - ${emp.full_name}: user_id=${emp.user_id}, role=${emp.role}`);
        });

        await connection.end();

    } catch (error) {
        console.error('Error:', error);
    }
}

checkEmployees();
