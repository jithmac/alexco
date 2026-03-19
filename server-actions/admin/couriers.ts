"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

export async function getCouriers() {
    try {
        const couriers = await query(`
            SELECT * FROM couriers
            WHERE is_active = TRUE
            ORDER BY created_at DESC
        `) as any[];
        return couriers;
    } catch (err) {
        console.error("Get Couriers Error:", err);
        return [];
    }
}

export async function addCourier(name: string, trackingUrlTemplate?: string) {
    try {
        const id = uuidv4();
        await query(`
            INSERT INTO couriers (id, name, tracking_url_template)
            VALUES (?, ?, ?)
        `, [id, name, trackingUrlTemplate || null]);

        revalidatePath('/paths/admin/settings/delivery');
        return { success: true };
    } catch (err) {
        console.error("Add Courier Error:", err);
        return { success: false, error: "Failed to add courier" };
    }
}

export async function updateCourier(id: string, name: string, trackingUrlTemplate?: string) {
    try {
        await query(`
            UPDATE couriers
            SET name = ?, tracking_url_template = ?
            WHERE id = ?
        `, [name, trackingUrlTemplate || null, id]);

        revalidatePath('/paths/admin/settings/delivery');
        return { success: true };
    } catch (err) {
        console.error("Update Courier Error:", err);
        return { success: false, error: "Failed to update courier" };
    }
}

export async function deleteCourier(id: string) {
    try {
        // Soft delete or hard delete? Let's check if used.
        // For simplicity, just soft delete (is_active = FALSE) or hard delete if not linked.
        // Given we don't have FK constraints enforcing strictly yet, we might just mark inactive.
        // But schema says is_active.
        await query(`UPDATE couriers SET is_active = FALSE WHERE id = ?`, [id]);
        revalidatePath('/paths/admin/settings/delivery');
        return { success: true };
    } catch (err) {
        console.error("Delete Courier Error:", err);
        return { success: false, error: "Failed to delete courier" };
    }
}
