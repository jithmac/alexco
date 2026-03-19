const mysql = require('mysql2/promise');

async function seedLocation() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'Ican123ZXC',
        database: 'alexco_db'
    });

    try {
        console.log("Connected to database.");

        const [rows] = await connection.execute('SELECT * FROM locations');

        if (rows.length === 0) {
            console.log("Locations table is empty. Seeding default location...");

            // Check table structure to see if 'type' column exists or if it's 'address'
            // We'll just try the two likely schemas
            try {
                // Schema 1: id, name, type
                await connection.execute(`
                    INSERT INTO locations (id, name, type)
                    VALUES (UUID(), 'Main Warehouse', 'Warehouse')
                `);
                console.log("✅ Seeded default location (Schema 1).");
            } catch (e) {
                // Schema 2: id, name, address, etc.
                if (e.code === 'ER_BAD_FIELD_ERROR') {
                    await connection.execute(`
                        INSERT INTO locations (id, name, address, is_active)
                        VALUES (UUID(), 'Main Warehouse', 'Default Address', 1)
                    `);
                    console.log("✅ Seeded default location (Schema 2).");
                } else {
                    throw e;
                }
            }
        } else {
            console.log("ℹ️ Locations table already has data.");
            console.log(rows);
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await connection.end();
    }
}

seedLocation();
