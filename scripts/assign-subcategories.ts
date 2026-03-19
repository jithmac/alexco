
import { query } from "../lib/db";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function assignSubcategories() {
    try {
        console.error("Starting subcategory assignment...");

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
            { skuPrefix: 'SMART-SW%', category: 'switches-sockets' }
        ];

        for (const update of updates) {
            console.error(`Updating ${update.skuPrefix} -> ${update.category}...`);
            const result = await query(`
                UPDATE products 
                SET category_path = ? 
                WHERE sku LIKE ?
            `, [update.category, update.skuPrefix]) as any;
            console.error(`Updated: ${result.affectedRows} rows.`);
        }

        console.error("\n--- Verification: Distinct Categories ---");
        const distCats = await query('SELECT DISTINCT category_path FROM products') as any[];
        distCats.forEach(c => console.error(`- ${c.category_path}`));

        console.error("Assignment complete.");
    } catch (e) {
        console.error("Error assigning subcategories:", e);
    }
}

assignSubcategories();
