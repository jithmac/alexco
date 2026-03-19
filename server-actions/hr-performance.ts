"use server";

import { query } from "@/lib/db";

// Calculate Retail Commission (Server-side logic)
export async function calculateCommissions(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    // 1. Get total sales per employee for the period
    const sales = await query(`
        SELECT so.cashier_id as employee_id, SUM(so.total_amount) as total_sales
        FROM sales_orders so
        WHERE so.created_at BETWEEN ? AND ? AND so.status = 'COMPLETED'
        GROUP BY so.cashier_id
    `, [startDate, endDate]) as any[];

    // 2. Fetch commission tiers
    const tiers = await query(`SELECT * FROM commission_tiers WHERE is_active = TRUE`) as any[];

    const results = [];

    for (const record of sales) {
        if (!record.employee_id) continue;

        let commission = 0;
        let appliedTier = null;

        // Simple tiered logic based on total sales volume
        // Real logic might need per-product category calculation, 
        // but this demonstrates the engine
        for (const tier of tiers) {
            if (record.total_sales >= tier.min_sales && record.total_sales < tier.max_sales) {
                commission = record.total_sales * tier.commission_rate;
                appliedTier = tier.tier_name;
                break;
            }
        }

        results.push({
            employee_id: record.employee_id,
            total_sales: record.total_sales,
            commission_amount: commission,
            tier_name: appliedTier
        });

        // Store in database
        const id = crypto.randomUUID();
        await query(`
            INSERT INTO employee_commissions (id, employee_id, period_month, period_year, sales_amount, commission_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, 'calculated')
        `, [id, record.employee_id, month, year, record.total_sales, commission]);
    }

    return results;
}

// Get Technician Scores
export async function getTechnicianPerformance(month: number, year: number) {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const sql = `
        SELECT 
            t.technician_id,
            COUNT(*) as total_tickets,
            SUM(CASE WHEN t.status = 'CLOSED' THEN 1 ELSE 0 END) as completed_tickets
        FROM tickets t
        WHERE t.created_at BETWEEN ? AND ?
        GROUP BY t.technician_id
    `;

    const rows = await query(sql, [startDate, endDate]) as any[];
    return rows;
}
