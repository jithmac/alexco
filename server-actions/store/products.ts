"use server";

import { query } from "@/lib/db";

export interface ProductProps {
    id: string;
    name: string;
    price: number;
    category: string;
    specs: any;
    image?: string;
    gallery?: any;
}

export async function getProducts(): Promise<ProductProps[]> {
    try {
        const rows = await query(`
      SELECT id, name, price_retail as price, category_path as category, specifications, sku, image, gallery
      FROM products
      WHERE (inventory_strategy != 'DISCONTINUED' OR inventory_strategy IS NULL) AND is_active = TRUE
      ORDER BY created_at DESC
    `) as any[];

        return rows.map(row => ({
            id: row.id,
            name: row.name,
            price: Number(row.price),
            category: row.category,
            specs: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications,
            image: row.image,
            gallery: typeof row.gallery === 'string' ? JSON.parse(row.gallery) : row.gallery
        }));
    } catch (error) {
        console.error("Database Error:", error);
        return [];
    }
}
