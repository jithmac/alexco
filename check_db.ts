import { config } from 'dotenv';
config({ path: '.env.local' });

import { query } from './lib/db';
import { getStoreCategories } from './server-actions/store/categories';

async function main() {
    try {
        const categories = await query('SELECT id, name, parent_id FROM categories');
        console.log("Categories DB flat:", categories);

        const storeCategories = await getStoreCategories();
        console.log("Store categories tree:", JSON.stringify(storeCategories, null, 2));

        const productsCols = await query('DESCRIBE products');
        console.log("Products schema:", productsCols);
    } catch (e) {
        console.error(e);
    }
    process.exit(0);
}
main();
