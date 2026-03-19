"use server";

import { query } from "@/lib/db";

export async function getContactMessages(status: string = "ALL") {
    try {
        let sql = `
            SELECT id, first_name, last_name, email, subject, message, status, created_at
            FROM contact_messages
        `;
        const params: string[] = [];

        if (status !== "ALL") {
            sql += ` WHERE status = ?`;
            params.push(status);
        }

        sql += ` ORDER BY created_at DESC LIMIT 100`;

        const messages = await query(sql, params);
        return messages as any[];
    } catch (err) {
        console.error("Get Contact Messages Error:", err);
        return [];
    }
}

export async function updateMessageStatus(messageId: string, newStatus: string) {
    try {
        await query(`UPDATE contact_messages SET status = ? WHERE id = ?`, [newStatus, messageId]);
        return { success: true };
    } catch (err) {
        console.error("Update Message Status Error:", err);
        return { success: false };
    }
}

export async function deleteMessage(messageId: string) {
    try {
        await query(`DELETE FROM contact_messages WHERE id = ?`, [messageId]);
        return { success: true };
    } catch (err) {
        console.error("Delete Message Error:", err);
        return { success: false };
    }
}
