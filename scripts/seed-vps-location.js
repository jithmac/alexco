const mysql = require('mysql2/promise');

async function seedVpsLocation() {
    const config = {
        host: 'monetize.lk',
        user: 'alexco_user',
        password: 'Ican123ZXC++',
        database: 'alexco_db',
        port: 3306
    };

    let connection;
    try {
        console.log("Connecting to VPS Database at monetize.lk...");
        connection = await mysql.createConnection(config);
        console.log("Connected successfully!");

        const [rows] = await connection.execute('SELECT * FROM locations');

        if (rows.length === 0) {
            console.log("Locations table is empty. Seeding default location...");
            await connection.execute(`
                INSERT INTO locations (id, name, type)
                VALUES (UUID(), 'Main Warehouse', 'Warehouse')
            `);
            console.log("✅ Seeded default location on VPS.");
        } else {
            console.log("ℹ️ Locations table already has data on VPS.");
            console.log(rows);
        }

    } catch (e) {
        console.error("VPS Seeding Failed:", e.message);
        if (e.code === 'ETIMEDOUT' || e.code === 'ECONNREFUSED') {
            console.error("\nTIP: Remote connection to 'monetize.lk' might be blocked by a firewall.");
            console.error("You will need to run this SQL command directly on the VPS:");
            console.error("INSERT INTO locations (id, name, type) VALUES (UUID(), 'Main Warehouse', 'Warehouse');");
        }
    } finally {
        if (connection) await connection.end();
    }
}

seedVpsLocation();
