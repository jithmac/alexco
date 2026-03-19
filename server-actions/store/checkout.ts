"use server";

import { query } from "@/lib/db";

export async function calculateDeliveryCost(items: { id: string, quantity: number }[]) {
    try {
        if (items.length === 0) return { cost: 0, weight: 0, details: [] };

        // 1. Get weights for all items
        const ids = items.map(i => i.id);
        const placeholders = ids.map(() => '?').join(',');

        const products = await query(`
            SELECT id, weight_g FROM products WHERE id IN (${placeholders})
        `, ids) as any[];

        // 2. Calculate total weight and details
        let totalWeight = 0;
        const details = items.map(item => {
            const product = products.find(p => p.id === item.id);
            const unitWeight = Number(product?.weight_g || 0);
            const lineWeight = unitWeight * item.quantity;
            totalWeight += lineWeight;

            return {
                id: item.id,
                unitWeight,
                lineWeight
            };
        });

        // 3. Find matching rate
        const rates = await query(`
            SELECT rate, min_weight_g, max_weight_g 
            FROM delivery_rates 
            WHERE ? >= min_weight_g AND ? <= max_weight_g
            ORDER BY rate ASC
            LIMIT 1
        `, [totalWeight, totalWeight]) as any[];

        let cost = 0;
        if (rates.length > 0) {
            cost = Number(rates[0].rate);
        } else {
            // Fallback: Use highest rate or default
            const maxRate = await query(`SELECT rate FROM delivery_rates ORDER BY max_weight_g DESC LIMIT 1`) as any[];
            cost = maxRate.length > 0 ? Number(maxRate[0].rate) : 500;
        }

        return { cost, weight: totalWeight, details };

    } catch (e) {
        console.error("Delivery Calc Error:", e);
        return { cost: 0, weight: 0, details: [] };
    }
}
