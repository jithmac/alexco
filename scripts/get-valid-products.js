require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function listProducts() {
    const connection = await mysql.createConnection(process.env.DATABASE_URL);
    try {
        const [rows] = await connection.query('SELECT id, name FROM products LIMIT 5');
        rows.forEach(r => {
            console.log("ID:", r.id);
            console.log("NAME:", r.name);
            console.log("---");
        });
    } catch (e) { console.error(e); }
    finally {
        await connection.end();
    }
}

listProducts();
