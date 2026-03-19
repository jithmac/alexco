import "dotenv/config";
import { query } from "./lib/db";

async function run() {
    const categories = await query("SELECT id, name, slug, parent_id FROM categories") as any[];
    const categoryPathMap = new Map<string, string>();

    const buildPath = (cat: any): string => {
        if (!cat.parent_id) return cat.name;
        const parent = categories.find(c => c.id === cat.parent_id);
        return parent ? `${buildPath(parent)} > ${cat.name}` : cat.name;
    };

    categories.forEach(c => {
        const fullPath = buildPath(c).toLowerCase();
        categoryPathMap.set(fullPath, c.slug);
        console.log(`Path: '${fullPath}' -> Slug: '${c.slug}'`);
    });

    console.log("Checking EXACT input: 'test > test 2'");
    console.log("Match found?", categoryPathMap.has("test > test 2"));

    process.exit(0);
}

run();
