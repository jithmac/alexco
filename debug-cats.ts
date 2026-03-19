
import dotenv from 'dotenv';
dotenv.config();
import { query } from "@/lib/db";

async function run() {
    try {
        const rows = await query("SELECT id, name, slug, parent_id FROM categories");
        console.log(JSON.stringify(rows, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
