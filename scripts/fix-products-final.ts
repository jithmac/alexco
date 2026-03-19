
import mysql from 'mysql2/promise';

async function run() {
    let connection: mysql.Connection | undefined;
    try {
        console.log("Connecting...");
        connection = await mysql.createConnection("mysql://root:Ican123ZXC@127.0.0.1:3306/alexco_db");
        console.log("Connected.");

        const updates = [
            // Solar Panels
            { skuPrefix: 'SOL-PNL%', category: 'solar-panels' },
            // Inverters
            { skuPrefix: 'INV-HUA%', category: 'inverters' },
            // Batteries
            { skuPrefix: 'BAT-LFP%', category: 'batteries' },
            // Solar Accessories (Cable)
            { skuPrefix: 'CABLE-PV%', category: 'solar-accessories' },
            // Switches
            { skuPrefix: 'SMART-SW%', category: 'switches-sockets' },
            // Computers check (should be 'computers')
            // Add if needed, but user said computers works.
        ];

        for (const update of updates) {
            console.log(`Updating ${update.skuPrefix} -> ${update.category}...`);
            if (!connection) throw new Error("No connection");
            const [result] = await connection.execute(`
                UPDATE products 
                SET category_path = ? 
                WHERE sku LIKE ?
            `, [update.category, update.skuPrefix]) as any;
            console.log(`Updated: ${result.affectedRows} rows.`);
        }

        console.log("Data Fix Complete.");

    } catch (e: any) {
        console.error("Error:", e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
