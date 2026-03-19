// const { getTicketDetails } = require('../server-actions/admin/tickets'); 

// Better approach: Create a standalone script that mimics the logic of getTicketDetails using the same DB connection, to test the query validity.

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function debug() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: { rejectUnauthorized: false }
    });

    try {
        console.log("1. Fetching a ticket ID...");
        const [tickets] = await connection.query('SELECT id FROM tickets LIMIT 1');
        if (tickets.length === 0) {
            console.log("No tickets found.");
            return;
        }
        const ticketId = tickets[0].id;
        console.log("Testing with Ticket ID:", ticketId);

        console.log("2. Fetching Ticket Details (Mimicking getTicketDetails)...");
        const [ticket] = await connection.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
        console.log("Ticket found:", !!ticket[0]);

        console.log("3. Fetching History (Mimicking getTicketHistory)...");
        try {
            const [history] = await connection.query('SELECT * FROM ticket_history WHERE ticket_id = ? ORDER BY created_at DESC', [ticketId]);
            console.log("History rows:", history.length);
        } catch (e) {
            console.error("HISTORY QUERY FAILED:", e.message);
        }

    } catch (error) {
        console.error("General DB Error:", error);
    } finally {
        await connection.end();
    }
}

debug();
