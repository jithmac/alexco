
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function inspectSchema() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);

        console.log('Inspecting employees table columns...');
        const [rows] = await connection.execute(`SHOW COLUMNS FROM employees`);

        // Log column names only for clarity if there are many
        const columns = rows.map(r => r.Field);
        console.log('Columns:', columns.join(', '));

        // Check specifically for user_id
        const userIdCol = rows.find(r => r.Field === 'user_id');
        if (userIdCol) {
            console.log('Found user_id column:', userIdCol);
        } else {
            console.log('user_id column NOT FOUND');
        }

        await connection.end();
    } catch (error) {
        console.error('Error:', error);
    }
}

inspectSchema();
