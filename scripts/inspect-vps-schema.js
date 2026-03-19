const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function inspectSchema() {
    const config = {
        host: process.env.DB_HOST || '127.0.0.1',
        user: process.env.DB_USER || 'alexco_user',
        password: process.env.DB_PASSWORD || 'Ican123ZXC++',
        database: process.env.DB_NAME || 'alexco_db',
        port: Number(process.env.DB_PORT) || 3306
    };

    console.log(`Inspecting schema on ${config.host}...`);
    let connection;
    try {
        connection = await mysql.createConnection(config);

        const tables = ['tickets', 'ticket_items', 'ticket_sequences', 'ticket_history', 'locations'];

        for (const table of tables) {
            console.log(`\n--- Table: ${table} ---`);
            try {
                const [cols] = await connection.query(`DESCRIBE ${table}`);
                console.table(cols);
            } catch (err) {
                console.error(`Error describing ${table}: ${err.message}`);
            }
        }

    } catch (error) {
        console.error("Connection Failed:", error.message);
    } finally {
        if (connection) await connection.end();
    }
}

inspectSchema();
