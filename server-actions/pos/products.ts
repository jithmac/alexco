"use server";

import { query } from "@/lib/db";

export async function getPosProducts() {
    try {
        const rows = await query(`
      SELECT 
        p.id, 
        p.name, 
        p.price_retail as price, 
        p.category_path as category, 
        p.sku,
        p.image,
        p.variations,
        p.variation_prices,
        p.variation_sale_prices,
        COALESCE(SUM(l.delta), 0) as stock_qty
      FROM products p
      LEFT JOIN inventory_ledger l ON p.id = l.product_id
      WHERE p.inventory_strategy != 'DISCONTINUED'
      GROUP BY p.id
    `) as any[];

        const variantRows = await query(`
            SELECT product_id, variant_id, SUM(delta) as stock 
            FROM inventory_ledger 
            WHERE variant_id IS NOT NULL 
            GROUP BY product_id, variant_id
        `) as any[];
        
        const variantStocksMap: Record<string, Record<string, number>> = {};
        for (const r of variantRows) {
            if (!variantStocksMap[r.product_id]) variantStocksMap[r.product_id] = {};
            variantStocksMap[r.product_id][r.variant_id] = Number(r.stock);
        }

        // Map to RxDB expected format
        return rows.map(p => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            category: p.category,
            sku: p.sku,
            image: p.image,
            variations: typeof p.variations === 'string' ? JSON.parse(p.variations) : (p.variations || {}),
            variation_prices: typeof p.variation_prices === 'string' ? JSON.parse(p.variation_prices) : (p.variation_prices || {}),
            variation_sale_prices: typeof p.variation_sale_prices === 'string' ? JSON.parse(p.variation_sale_prices) : (p.variation_sale_prices || {}),
            stock: Number(p.stock_qty) || 0,
            variant_stocks: variantStocksMap[p.id] || {}
        }));
    } catch (err) {
        console.error("POS Fetch Error:", err);
        throw new Error("Failed to fetch products for POS");
    }
}
