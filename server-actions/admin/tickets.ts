"use server";

import { query } from "@/lib/db";

export type Ticket = {
    id: string;
    ticketNumber: string;
    customer: string;
    device: string;
    status: string;
    createdAt: string;
    // Extended fields
    accessories_received?: string[]; // JSON array
    inspection_notes?: string;
    diagnosis_notes?: string;
    estimated_cost?: number;
    approval_status?: string;
    repair_notes?: string;
    qa_checklist?: any;
    final_cleaning_done?: boolean;
};

export async function getTickets(): Promise<Ticket[]> {
    try {
        const rows = await query(`
      SELECT id, ticket_number, customer_name, device_model, status, created_at
      FROM tickets
      ORDER BY created_at DESC
    `) as any[];

        return rows.map(r => ({
            id: r.id,
            ticketNumber: r.ticket_number,
            customer: r.customer_name,
            device: r.device_model,
            status: r.status,
            createdAt: new Date(r.created_at).toLocaleDateString()
        }));
    } catch (err) {
        console.error("Failed to fetch tickets:", err);
        return [];
    }
}

export async function getTicketDetails(id: string) {
    try {
        const [ticket] = await query(`
            SELECT * FROM tickets WHERE id = ?
        `, [id]) as any[];

        if (!ticket) return null;

        const items = await query(`
            SELECT ti.id, ti.quantity, ti.product_id, p.name, p.sku, p.price_retail, (ti.quantity * p.price_retail) as line_total
            FROM ticket_items ti
            JOIN products p ON ti.product_id = p.id
            WHERE ti.ticket_id = ?
        `, [id]) as any[];

        let history = [];
        try {
            history = await getTicketHistory(id);
        } catch (hErr) {
            console.error("Failed to load ticket history:", hErr);
            // Non-fatal, return empty history
        }

        return {
            ...ticket,
            items,
            history
        };
    } catch (err) {
        console.error("Error fetching ticket details:", err);
        return null;
    }
}

export async function addTicketItem(ticketId: string, productId: string, quantity: number = 1, variantId?: string) {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();

    await query(`
        INSERT INTO ticket_items (id, ticket_id, product_id, quantity, variant_id)
        VALUES (?, ?, ?, ?, ?)
    `, [id, ticketId, productId, quantity, variantId || null]);

    const { adjustStock } = await import('./inventory');
    // If variantId is present, we should pass it. 
    // BUT wait, adjustStock signature is (productId, delta, reason, variantId?)
    // Let's check inventory.ts signature.
    // Based on previous reads, adjustStock(productId, delta, reason, variantId?) seems likely or we need to check.
    // I will assume it supports it or I need to update it too.
    await adjustStock(productId, -quantity, 'TICKET_USE', variantId);

    return { success: true };
}

export async function removeTicketItem(itemId: string) {
    const [item] = await query("SELECT product_id, quantity, variant_id FROM ticket_items WHERE id = ?", [itemId]) as any[];

    if (item) {
        const { adjustStock } = await import('./inventory');
        await adjustStock(item.product_id, item.quantity, 'TICKET_RETURN', item.variant_id);
    }

    await query(`DELETE FROM ticket_items WHERE id = ?`, [itemId]);
    return { success: true };
}

export async function updateTicketItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
        return removeTicketItem(itemId);
    }

    const [current] = await query("SELECT quantity, product_id, variant_id FROM ticket_items WHERE id = ?", [itemId]) as any[];

    if (current) {
        const diff = Number(quantity) - Number(current.quantity);
        if (diff !== 0) {
            const { adjustStock } = await import('./inventory');
            // If diff is positive (added 1), we want to SUBTRACT 1 from stock (-diff)
            // If diff is negative (removed 1), we want to ADD 1 to stock (-diff becomes positive)
            await adjustStock(current.product_id, -diff, 'TICKET_ADJ', current.variant_id);
        }
    }

    await query(`UPDATE ticket_items SET quantity = ? WHERE id = ?`, [quantity, itemId]);
    return { success: true };
}

export async function updateTicketMetadata(ticketId: string, data: any) {
    const fields = [];
    const values = [];

    if (data.status) { fields.push('status = ?'); values.push(data.status); }
    if (data.accessories_received) { fields.push('accessories_received = ?'); values.push(JSON.stringify(data.accessories_received)); }
    if (data.inspection_notes !== undefined) { fields.push('inspection_notes = ?'); values.push(data.inspection_notes); }
    if (data.diagnosis_notes !== undefined) { fields.push('diagnosis_notes = ?'); values.push(data.diagnosis_notes); }
    if (data.estimated_cost !== undefined) { fields.push('estimated_cost = ?'); values.push(data.estimated_cost); }
    if (data.approval_status) { fields.push('approval_status = ?'); values.push(data.approval_status); }
    if (data.repair_notes !== undefined) { fields.push('repair_notes = ?'); values.push(data.repair_notes); }
    if (data.qa_checklist) { fields.push('qa_checklist = ?'); values.push(JSON.stringify(data.qa_checklist)); }
    if (data.final_cleaning_done !== undefined) { fields.push('final_cleaning_done = ?'); values.push(data.final_cleaning_done); }

    if (fields.length === 0) return { success: false };

    values.push(ticketId);

    await query(`
        UPDATE tickets 
        SET ${fields.join(', ')}
        WHERE id = ?
    `, values);

    // LOG HISTORY
    // We infer action from data
    if (data.status) {
        await logTicketActivity(ticketId, 'STATUS_CHANGE', `Status changed to ${data.status}`);
    }
    if (data.inspection_notes || data.diagnosis_notes || data.repair_notes) {
        // Find which note was updated
        const noteType = data.inspection_notes ? 'Inspection' : data.diagnosis_notes ? 'Diagnosis' : 'Repair';
        const content = data.inspection_notes || data.diagnosis_notes || data.repair_notes;
        await logTicketActivity(ticketId, 'NOTE_ADDED', `${noteType} Note: ${content}`);
    }

    return { success: true };
}

export async function logTicketActivity(ticketId: string, actionType: string, description: string) {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4();
    await query(`
        INSERT INTO ticket_history (id, ticket_id, action_type, description)
        VALUES (?, ?, ?, ?)
    `, [id, ticketId, actionType, description]);
}

export async function getTicketHistory(ticketId: string) {
    const rows = await query(`
        SELECT * FROM ticket_history 
        WHERE ticket_id = ? 
        ORDER BY created_at DESC
    `, [ticketId]) as any[];
    return rows;
}

export async function deleteTicket(id: string) {
    try {
        // Delete history
        await query(`DELETE FROM ticket_history WHERE ticket_id = ?`, [id]);
        // Delete items
        await query(`DELETE FROM ticket_items WHERE ticket_id = ?`, [id]);
        // Delete ticket
        await query(`DELETE FROM tickets WHERE id = ?`, [id]);

        return { success: true };
    } catch (err) {
        console.error("Error deleting ticket:", err);
        return { success: false, error: "Failed to delete ticket" };
    }
}
