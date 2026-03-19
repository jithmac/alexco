"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { requirePermission } from "@/lib/auth";

export async function createSalesOrder(orderData: {
    items: { productId: string; price: number; quantity: number; variations?: Record<string, string> }[];
    total: number;
    paymentMethod: string;
    cashierId?: string; // Optional for now
}) {
    const { items, total, paymentMethod, cashierId } = orderData; // cashierId from client is optional/informational
    const { v4: uuidv4 } = await import("uuid");

    try {
        await requirePermission('pos.access');

        const orderId = uuidv4();
        // Generate a friendly order number (e.g. ORD-TIMESTAMP) - in real app use a sequence
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;

        // 1. Get Location (Default Store)
        const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];
        const locationId = loc ? loc.id : null;

        if (!locationId) throw new Error("No location configured");

        // 2. Insert Order
        await query(`
            INSERT INTO sales_orders (id, order_number, total_amount, status, payment_method, location_id, sync_status)
            VALUES (?, ?, ?, 'COMPLETED', ?, ?, 'SYNCED')
        `, [orderId, orderNumber, total, paymentMethod, locationId]);

        // 3. Process Items & Inventory
        for (const item of items) {
            const lineTotal = item.price * item.quantity;

            // Insert Sales Item
            await query(`
                INSERT INTO sales_items (id, order_id, product_id, quantity, unit_price, line_total, variant_options)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                uuidv4(),
                orderId,
                item.productId,
                item.quantity,
                item.price,
                lineTotal,
                item.variations ? JSON.stringify(item.variations) : null
            ]);

            // Deduct Inventory (Ledger)
            await query(`
                INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                VALUES (?, ?, ?, ?, 'SALE_POS', ?)
            `, [uuidv4(), item.productId, locationId, -item.quantity, orderNumber]);
        }

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory'); // Update admin view

        return { success: true, orderNumber };

    } catch (err) {
        console.error("Create Sales Order Error:", err);
        return { success: false, error: "Transaction failed" };
    }
}

export async function getOrderDetails(orderNumber: string) {
    try {
        const [order] = await query(`
            SELECT * FROM sales_orders WHERE order_number = ?
        `, [orderNumber]) as any[];

        if (!order) return null;

        const items = await query(`
            SELECT si.quantity, si.unit_price, si.line_total, p.name, p.sku, si.variant_options
            FROM sales_items si
            JOIN products p ON si.product_id = p.id
            WHERE si.order_id = ?
        `, [order.id]) as any[];

        return {
            ...order,
            items
        };
    } catch (err) {
        console.error("Get Order Error:", err);
        return null;
    }
}

export async function getRecentOrders(limit: number = 50) {
    try {
        const orders = await query(`
            SELECT id, order_number, total_amount, payment_method, created_at, status
            FROM sales_orders
            ORDER BY created_at DESC
            LIMIT ?
        `, [limit.toString()]) as any[];

        return orders;
    } catch (err) {
        console.error("Get Recent Orders Error:", err);
        return [];
    }
}

export async function searchOrders(params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'created_at' | 'total_amount' | 'order_number';
    sortOrder?: 'asc' | 'desc';
    date?: string;
}) {
    const { page = 1, limit = 20, search = '', sortBy = 'created_at', sortOrder = 'desc', date } = params;

    try {
        const offset = (page - 1) * limit;
        const validSortColumns = ['created_at', 'total_amount', 'order_number'];
        const validSortOrder = ['asc', 'desc'];

        const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
        const safeSortOrder = validSortOrder.includes(sortOrder) ? sortOrder : 'desc';

        const whereClauses = [];
        const queryParams = [];

        if (search) {
            whereClauses.push(`(order_number LIKE ? OR payment_method LIKE ?)`);
            queryParams.push(`%${search}%`, `%${search}%`);
        }

        if (date) {
            whereClauses.push(`DATE(created_at) = ?`);
            queryParams.push(date);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM sales_orders ${whereSQL}`;
        const [countResult] = await query(countSql, queryParams) as any[];
        const total = countResult?.total || 0;

        // Get data
        // Note: We use template literal for ORDER BY column/direction because they cannot be parameterized directly in SQL
        // We sanitized them above against allowlists to prevent injection.
        const sql = `
            SELECT id, order_number, total_amount, payment_method, created_at, status
            FROM sales_orders
            ${whereSQL}
            ORDER BY ${safeSortBy} ${safeSortOrder}
            LIMIT ? OFFSET ?
        `;

        // Pass LIMIT and OFFSET as strings to avoid type issues with some MySQL drivers in prepared statements
        const rows = await query(sql, [...queryParams, limit.toString(), offset.toString()]) as any[];

        return {
            orders: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };

    } catch (err) {
        console.error("Search Orders Error:", err);
        return { orders: [], total: 0, page: 1, totalPages: 0 };
    }
}

export async function syncPosOrder(orderData: any) {
    try {
        // Map offline order to createSalesOrder format
        const result = await createSalesOrder({
            items: orderData.items,
            total: orderData.total,
            paymentMethod: orderData.payment_method || 'CASH',
            cashierId: 'offline-sync'
        });

        return { success: result.success };
    } catch (e) {
        console.error("Sync Order Error:", e);
        return { success: false };
    }
}
