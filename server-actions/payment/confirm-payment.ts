"use server";

import { query } from "@/lib/db";

/**
 * Called from the client when PayHere's onCompleted fires.
 * This is a fallback in case the server-to-server webhook didn't reach us
 * (e.g. ngrok URL expired, server was down, etc.).
 * 
 * It only promotes AWAITING_PAYMENT → CONFIRMED. If the webhook already
 * processed it, this is a safe no-op because the WHERE clause won't match.
 */
export async function confirmPayHerePayment(orderNumber: string) {
    try {
        if (!orderNumber) {
            return { success: false, error: "Missing order number" };
        }

        // Only update if still AWAITING_PAYMENT (idempotent — safe to call multiple times)
        const result = await query(`
            UPDATE sales_orders 
            SET status = 'PROCESSING', 
                payment_status = 'PAID', 
                delivery_status = 'CONFIRMED'
            WHERE order_number = ? AND delivery_status = 'AWAITING_PAYMENT'
        `, [orderNumber]) as any;

        const affectedRows = result?.affectedRows ?? 0;

        if (affectedRows > 0) {
            // Stock deduction — only if we actually changed the status
            const [order] = await query(
                `SELECT id, location_id, order_number FROM sales_orders WHERE order_number = ?`,
                [orderNumber]
            ) as any[];

            if (order) {
                const items = await query(
                    `SELECT product_id, quantity FROM sales_items WHERE order_id = ?`,
                    [order.id]
                ) as any[];

                const { v4: uuidv4 } = await import("uuid");
                for (const item of items) {
                    await query(`
                        INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                        VALUES (?, ?, ?, ?, 'SALE_ONLINE', ?)
                    `, [uuidv4(), item.product_id, order.location_id, -item.quantity, order.order_number]);
                }
            }

            console.log(`✅ [Client Fallback] Order ${orderNumber} confirmed and stock deducted.`);
        } else {
            console.log(`ℹ️ [Client Fallback] Order ${orderNumber} was already confirmed (no rows affected).`);
        }

        // Revalidate admin orders page
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/orders');

        return { success: true };

    } catch (err: any) {
        console.error("Confirm PayHere Payment Error:", err);
        return { success: false, error: err.message };
    }
}

/**
 * Admin action: manually confirm a PayHere order that's stuck at AWAITING_PAYMENT.
 * This does the same thing as the webhook/client fallback.
 */
export async function adminConfirmPayHereOrder(orderId: string) {
    try {
        // Get the order first
        const [order] = await query(
            `SELECT id, order_number, location_id, delivery_status FROM sales_orders WHERE id = ?`,
            [orderId]
        ) as any[];

        if (!order) {
            return { success: false, error: "Order not found" };
        }

        if (order.delivery_status !== 'AWAITING_PAYMENT') {
            return { success: false, error: `Order is already ${order.delivery_status}` };
        }

        // Update order status
        await query(`
            UPDATE sales_orders 
            SET status = 'PROCESSING', 
                payment_status = 'PAID', 
                delivery_status = 'CONFIRMED'
            WHERE id = ?
        `, [orderId]);

        // Deduct inventory
        const items = await query(
            `SELECT product_id, quantity FROM sales_items WHERE order_id = ?`,
            [order.id]
        ) as any[];

        const { v4: uuidv4 } = await import("uuid");
        for (const item of items) {
            await query(`
                INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                VALUES (?, ?, ?, ?, 'SALE_ONLINE', ?)
            `, [uuidv4(), item.product_id, order.location_id, -item.quantity, order.order_number]);
        }

        console.log(`✅ [Admin] Order ${order.order_number} manually confirmed.`);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/orders');

        return { success: true };

    } catch (err: any) {
        console.error("Admin Confirm PayHere Order Error:", err);
        return { success: false, error: err.message };
    }
}
