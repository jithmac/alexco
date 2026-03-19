const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });
const mysql = require('mysql2/promise');

async function checkTickets() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error("DATABASE_URL not found");
        return;
    }

    try {
        const connection = await mysql.createConnection(connectionString);
        const [rows] = await connection.execute("SELECT ticket_number, customer_phone FROM tickets LIMIT 5");
        console.log("Current Tickets:", rows);
        await connection.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkTickets();
