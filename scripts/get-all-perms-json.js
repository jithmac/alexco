
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function getPerms() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        const [perms] = await connection.execute('SELECT * FROM permissions');
        console.log(JSON.stringify(perms));
        await connection.end();
    } catch (e) { console.error(e); }
}
getPerms();
