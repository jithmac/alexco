"use server";

import { v4 as uuidv4 } from 'uuid';
// import { query } from '@/lib/db'; // Placeholder for DB connection

export type TicketStatus = 'INTAKE' | 'DIAGNOSIS' | 'PENDING_PARTS' | 'READY' | 'CLOSED';

export interface TicketData {
    customerName: string;
    customerPhone: string;
    deviceSerial: string;
    deviceModel: string;
    issueDescription: string;
    technicianId?: string;
    estimatedCost?: number;
}

const mockSMSGateway = async (phone: string, message: string) => {
    console.log(`[SMS GATEWAY] To: ${phone} | Msg: ${message}`);
    // Integration with Notify.lk or Text.lk would happen here
};

export async function createJobTicket(data: TicketData) {
    const { query } = await import('@/lib/db');

    // Prevent duplicates (same name and device in the last 30 seconds)
    const [existing] = await query(`
        SELECT id FROM tickets 
        WHERE customer_name = ? AND device_model = ? 
        AND created_at > DATE_SUB(NOW(), INTERVAL 30 SECOND)
        LIMIT 1
    `, [data.customerName, data.deviceModel]) as any[];

    if (existing) {
        return { success: false, error: 'A similar ticket was recently created. Please check the ticket list.' };
    }

    // Get next ID from sequence
    await query('INSERT INTO ticket_sequences (id) VALUES (NULL)');
    const rows = (await query('SELECT LAST_INSERT_ID() as id')) as any[];
    const seqId = rows[0].id;

    // Format: JOB-YYYY-SEQ (e.g., JOB-2026-1001)
    const year = new Date().getFullYear();
    const ticketNumber = `JOB-${year}-${seqId}`;
    const ticketId = uuidv4();

    await query(
        `INSERT INTO tickets (id, ticket_number, customer_name, customer_phone, device_serial, device_model, issue_description, status, accessories_received, estimated_cost)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'RECEIVED', ?, ?)`,
        [ticketId, ticketNumber, data.customerName, data.customerPhone, data.deviceSerial, data.deviceModel, data.issueDescription, JSON.stringify([]), data.estimatedCost || null]
    );

    // Initial History Log
    const histId = uuidv4();
    await query(`
        INSERT INTO ticket_history (id, ticket_id, action_type, description)
        VALUES (?, ?, 'CREATED', 'Ticket created locally')
    `, [histId, ticketId]);

    // Send "Received" SMS
    await mockSMSGateway(
        data.customerPhone,
        `Alexco: We have received your device(${data.deviceModel}).Job ID: #${ticketNumber}.Track status at alexco.lk / track`
    );

    return { success: true, ticketNumber, ticketId };
}

export async function updateTicketStatus(ticketId: string, newStatus: TicketStatus, customerPhone?: string) {
    const { query } = await import('@/lib/db');

    // Update ticket status in database
    await query(`UPDATE tickets SET status = ? WHERE id = ?`, [newStatus, ticketId]);

    // Log status change in history
    const histId = crypto.randomUUID();
    await query(`
        INSERT INTO ticket_history (id, ticket_id, action_type, description)
        VALUES (?, ?, 'STATUS_CHANGE', ?)
    `, [histId, ticketId, `Status changed to ${newStatus}`]);

    // Status-specific logic
    if (newStatus === 'READY' && customerPhone) {
        await mockSMSGateway(
            customerPhone,
            `Alexco: Your device is ready for pickup. Shop open until 6 PM.`
        );
    }

    return { success: true, status: newStatus };
}
