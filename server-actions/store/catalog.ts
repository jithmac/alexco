"use server";

import { query } from "@/lib/db";

export async function searchProducts(term: string) {
    if (!term) return [];

    // Simple search for now
    // Priority: Name starts with > Name contains > SKU > Description
    const rows = await query(`
        SELECT id, name, price_retail, price_sale, category_path, specifications, sku
        FROM products
        WHERE (name LIKE ? OR sku LIKE ? OR description LIKE ? OR category_path LIKE ?) AND is_active = TRUE
        ORDER BY 
            CASE 
                WHEN name LIKE ? THEN 1
                WHEN name LIKE ? THEN 2
                ELSE 3
            END,
            name ASC
        LIMIT 50
    `, [
        `%${term}%`, `%${term}%`, `%${term}%`, `%${term}%`,
        `${term}%`, // Starts with
        `%${term}%` // Contains
    ]) as any[];

    return rows.map(row => ({
        id: row.id,
        name: row.name,
        price: Number(row.price_sale > 0 ? row.price_sale : row.price_retail),
        original_price: Number(row.price_retail),
        category: row.category_path,
        sku: row.sku,
        image: null // TODO: Add images
    }));
}
