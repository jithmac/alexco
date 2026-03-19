import { query } from "./lib/db";

async function checkSchema() {
    try {
        const rows = await query("DESCRIBE products");
        console.log("Products schema:", rows);

        const categories = await query("SELECT id, name, parent_id FROM categories");
        console.log("Categories:", categories);
    } catch (e) {
        console.error(e);
    }
}

checkSchema();
