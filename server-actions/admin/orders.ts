"use server";

import { query } from "@/lib/db";

export async function getOnlineOrders(statusFilter: string = "ALL") {
    try {
        let sql = `
            SELECT o.id, o.order_number, o.total_amount, o.payment_method, o.delivery_method, o.status, 
                   o.delivery_status, o.payment_status,
                   o.customer_name, o.customer_phone, o.customer_email, o.payment_proof, o.created_at, o.shipping_address,
                   o.courier_id, o.tracking_number, c.name as courier_name, c.tracking_url_template
            FROM sales_orders o
            LEFT JOIN couriers c ON o.courier_id = c.id
            WHERE o.order_source = 'ONLINE'
        `;
        const params: any[] = [];

        if (statusFilter !== "ALL") {
            sql += ` AND o.delivery_status = ?`;
            params.push(statusFilter);
        }

        sql += ` ORDER BY o.created_at DESC`;

        const orders = await query(sql, params) as any[];

        for (const order of orders) {
            const items = await query(`
                SELECT si.quantity, si.unit_price, si.line_total, p.name as product_name, si.variant_options
                FROM sales_items si
                LEFT JOIN products p ON si.product_id = p.id
                WHERE si.order_id = ?
            `, [order.id]) as any[];
            order.items = items;

            // Normalize null delivery_status
            if (!order.delivery_status) {
                order.delivery_status = order.delivery_method === 'pickup' ? 'PICKUP' : 'PENDING';
            }
        }

        return orders;
    } catch (err) {
        console.error("Get Online Orders Error:", err);
        return [];
    }
}

export async function updateOrderStatus(orderId: string, status: string, courierId?: string, trackingNumber?: string) {
    try {
        let sql = `UPDATE sales_orders SET delivery_status = ?`;
        const params: any[] = [status];

        if (courierId !== undefined) {
            sql += `, courier_id = ?`;
            params.push(courierId || null);
        }
        if (trackingNumber !== undefined) {
            sql += `, tracking_number = ?`;
            params.push(trackingNumber || null);
        }

        sql += `, updated_at = NOW() WHERE id = ?`;
        params.push(orderId);

        await query(sql, params);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/orders');

        return { success: true };
    } catch (err) {
        console.error("Update Order Status Error:", err);
        return { success: false, error: "Failed to update status" };
    }
}

export async function confirmOrder(orderId: string) {
    try {
        await query(`
            UPDATE sales_orders 
            SET delivery_status = 'CONFIRMED', status = 'PROCESSING', updated_at = NOW()
            WHERE id = ?
        `, [orderId]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/orders');

        return { success: true };
    } catch (err) {
        console.error("Confirm Order Error:", err);
        return { success: false, error: "Failed to confirm order" };
    }
}
