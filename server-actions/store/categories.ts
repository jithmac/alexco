"use server";

import { query } from "@/lib/db";

export type StoreCategory = {
    id: string;
    name: string;
    slug: string;
    description: string;
    image: string | null;
    icon: string | null;
    children?: StoreCategory[];
};

export async function getStoreCategories(): Promise<StoreCategory[]> {
    try {
        // Only fetch active categories
        const rows = await query(`
            SELECT id, name, slug, description, parent_id, image, icon, order_index
            FROM categories
            WHERE is_active = TRUE
            ORDER BY order_index ASC, name ASC
        `) as any[];

        const categoryMap = new Map<string, StoreCategory>();
        const rootCategories: StoreCategory[] = [];

        // First pass
        rows.forEach(cat => {
            const { parent_id, ...rest } = cat;
            const storeCat = { ...rest, children: [] };
            categoryMap.set(cat.id, storeCat);
        });

        // Second pass
        rows.forEach(cat => {
            if (cat.parent_id && categoryMap.has(cat.parent_id)) {
                categoryMap.get(cat.parent_id)!.children!.push(categoryMap.get(cat.id)!);
            } else if (!cat.parent_id) {
                rootCategories.push(categoryMap.get(cat.id)!);
            }
        });

        return rootCategories;
    } catch (e) {
        console.error("Get Store Categories Error:", e);
        return [];
    }
}
