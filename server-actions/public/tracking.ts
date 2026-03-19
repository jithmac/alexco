"use server";

import { query } from "@/lib/db";

export async function trackTicket(ticketNumber: string, phone: string) {
    // 1. Sanitize Inputs
    const cleanPhone = phone.replace(/\D/g, '');
    const normalizedTicketUser = ticketNumber.trim().toUpperCase();

    // 2. Find Ticket
    // Use LOWER() or just match against normalized input if we assume DB is standard
    // We'll use the clean phone for matching
    const [ticket] = await query(`
        SELECT id, ticket_number, customer_name, device_model, status, created_at, estimated_cost
        FROM tickets 
        WHERE ticket_number = ? AND (
            customer_phone LIKE ? OR 
            customer_phone = ? OR
            REPLACE(REPLACE(REPLACE(customer_phone, '-', ''), ' ', ''), '+', '') LIKE ?
        )
    `, [normalizedTicketUser, `%${cleanPhone}`, cleanPhone, `%${cleanPhone}`]) as any[];

    if (!ticket) {
        // Fallback: try case-insensitive search if direct match failed
        const [ticketFallback] = await query(`
            SELECT id, ticket_number, customer_name, device_model, status, created_at, estimated_cost
            FROM tickets 
            WHERE ticket_number = ? AND (
                 customer_phone LIKE ? OR 
                 customer_phone = ?
            )
        `, [ticketNumber.trim(), `%${phone}`, phone]) as any[];

        if (ticketFallback) {
            // Found it with raw input, maybe DB has stricter phone format?
            // But let's return it.
            const history = await query(`
                SELECT action_type, description, created_at 
                FROM ticket_history 
                WHERE ticket_id = ? 
                ORDER BY created_at DESC
            `, [ticketFallback.id]) as any[];
            return { success: true, ticket: ticketFallback, history };
        }

        return { success: false, message: "Ticket not found or phone number mismatch." };
    }

    // 3. Get History
    const history = await query(`
        SELECT action_type, description, created_at 
        FROM ticket_history 
        WHERE ticket_id = ? 
        ORDER BY created_at DESC
    `, [ticket.id]) as any[];

    return { success: true, ticket, history };
}

export async function trackOrder(orderNumber: string, contact: string) {
    // 1. Find Order
    // Match order_number and (email OR phone)
    const [order] = await query(`
        SELECT o.id, o.order_number, o.customer_name, o.delivery_status, o.total_amount, o.created_at, o.shipping_address,
               o.tracking_number, c.name as courier_name, c.tracking_url_template
        FROM sales_orders o
        LEFT JOIN couriers c ON o.courier_id = c.id
        WHERE o.order_number = ? AND (o.customer_email = ? OR o.customer_phone LIKE ? OR o.customer_phone = ?)
    `, [orderNumber, contact, `%${contact}`, contact]) as any[];

    if (!order) {
        return { success: false, message: "Order not found or contact details mismatch." };
    }

    // 2. Get Items
    const rows = await query(`
        SELECT si.quantity, p.name, p.image, p.gallery
        FROM sales_items si
        LEFT JOIN products p ON si.product_id = p.id
        WHERE si.order_id = ?
    `, [order.id]) as any[];

    const items = rows.map(r => {
        const gallery = typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery;
        const mainImage = (Array.isArray(gallery) && gallery.length > 0) ? gallery[0] : r.image;
        return {
            quantity: r.quantity,
            name: r.name,
            image: mainImage
        };
    });

    return { success: true, order, items };
}
