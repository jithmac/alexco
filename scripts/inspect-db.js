
const mysql = require('mysql2/promise');
require('dotenv').config();

async function listTables() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306
    });

    try {
        const [tables] = await connection.query("SHOW TABLES");
        console.log("Tables:", tables.map(t => Object.values(t)[0]));

        const [users] = await connection.query("DESCRIBE users");
        console.log("Users Table Schema:", users);

        const [adminUsers] = await connection.query("SELECT * FROM users");
        console.log("Existing Users:", adminUsers);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await connection.end();
    }
}

listTables();
