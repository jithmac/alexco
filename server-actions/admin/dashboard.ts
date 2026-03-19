"use server";

import { query } from "@/lib/db";
import { requirePermission } from "@/lib/auth";

export async function getDashboardStats() {
    // Return defaults during build or when auth fails
    const defaultStats = {
        todaySales: 0,
        salesPercentage: "0",
        activeTickets: 0,
        pendingTickets: 0,
        lowStockItems: 0,
        onlineOrders: 0,
        toShipOrders: 0
    };

    try {
        await requirePermission('admin.view');
    } catch (e) {
        // Return defaults during build-time prerendering
        return defaultStats;
    }

    try {
        // 1. Total Sales Today
        const [salesRow] = await query(`
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM sales_orders 
            WHERE DATE(created_at) = CURDATE() AND delivery_status != 'CANCELLED'
        `) as any[];

        // 2. Yesterday Sales (for percentage)
        const [yesterdayRow] = await query(`
            SELECT COALESCE(SUM(total_amount), 0) as total 
            FROM sales_orders 
            WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY) AND delivery_status != 'CANCELLED'
        `) as any[];

        const todaySales = Number(salesRow.total);
        const yesterdaySales = Number(yesterdayRow.total);
        let salesPercentage = 0;
        if (yesterdaySales > 0) {
            salesPercentage = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
        }

        // 3. Active Tickets
        const [ticketsRow] = await query(`
            SELECT COUNT(*) as count FROM tickets WHERE status != 'CLOSED'
        `) as any[];

        const [pendingTicketsRow] = await query(`
            SELECT COUNT(*) as count FROM tickets WHERE status = 'INTAKE' OR approval_status = 'PENDING'
        `) as any[];

        // 4. Low Stock Items (threshold < 10)
        const [lowStockRow] = await query(`
            SELECT COUNT(*) as count FROM (
                SELECT p.id
                FROM products p
                LEFT JOIN inventory_ledger il ON p.id = il.product_id
                GROUP BY p.id
                HAVING COALESCE(SUM(il.delta), 0) < 10
            ) as low_stock_pool
        `) as any[];

        // 5. Online Orders
        const [ordersRow] = await query(`
            SELECT COUNT(*) as count FROM sales_orders WHERE order_source = 'ONLINE'
        `) as any[];

        const [toShipRow] = await query(`
            SELECT COUNT(*) as count FROM sales_orders 
            WHERE order_source = 'ONLINE' AND delivery_status IN ('PENDING', 'CONFIRMED')
        `) as any[];

        return {
            todaySales,
            salesPercentage: salesPercentage.toFixed(1),
            activeTickets: ticketsRow.count,
            pendingTickets: pendingTicketsRow.count,
            lowStockItems: lowStockRow.count,
            onlineOrders: ordersRow.count,
            toShipOrders: toShipRow.count
        };
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return {
            todaySales: 0,
            salesPercentage: "0",
            activeTickets: 0,
            pendingTickets: 0,
            lowStockItems: 0,
            onlineOrders: 0,
            toShipOrders: 0
        };
    }
}
