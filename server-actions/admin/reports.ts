"use server";

import { query } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export type MarginReportItem = {
    id: string;
    name: string;
    sku: string;
    category_path: string;
    cost_price: number;
    retail_price: number;
    sale_price: number;
    active_price: number;
    margin_value: number;
    margin_percent: number;
    stock: number;
};

export async function getMarginReportData(): Promise<MarginReportItem[]> {
    try {
        const rows = await query(`
            SELECT 
                p.id, p.name, p.sku, p.category_path, 
                p.price_retail, p.price_cost, p.price_sale,
                COALESCE(SUM(l.delta), 0) as current_stock
            FROM products p
            LEFT JOIN inventory_ledger l ON p.id = l.product_id
            GROUP BY p.id
            ORDER BY p.name ASC
        `) as any[];

        return rows.map(row => {
            const cost = Number(row.price_cost) || 0;
            const retail = Number(row.price_retail) || 0;
            const sale = Number(row.price_sale) || 0;

            // Determine active selling price (Sale price if > 0 and < Retail)
            const activePrice = (sale > 0 && sale < retail) ? sale : retail;

            const marginValue = activePrice - cost;
            const marginPercent = activePrice > 0 ? (marginValue / activePrice) * 100 : 0;

            return {
                id: row.id,
                name: row.name,
                sku: row.sku,
                category_path: row.category_path,
                cost_price: cost,
                retail_price: retail,
                sale_price: sale,
                active_price: activePrice,
                margin_value: marginValue,
                margin_percent: marginPercent,
                stock: Number(row.current_stock)
            };
        });
    } catch (error) {
        console.error("Margin Report Error:", error);
        return [];
    }
}
