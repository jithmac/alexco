"use server";

import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function linkUserProfile(candidateId?: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    if (user.employee_id && !candidateId) {
        return { success: true, message: "Already linked" };
    }

    try {
        // 0. If candidate ID provided (Manual Selection)
        if (candidateId) {
            const [target] = await query(`SELECT id, full_name FROM employees WHERE id = ?`, [candidateId]) as any[];
            if (!target) return { error: "Invalid employee ID" };

            await query(`UPDATE users SET employee_id = ? WHERE id = ?`, [target.id, user.id]);
            revalidatePath('/paths/my-portal');
            return { success: true, message: `Successfully linked to ${target.full_name}` };
        }

        // 1. Try match by Email
        if (user.email) {
            const [employee] = await query(`SELECT id, full_name, designation FROM employees WHERE email = ?`, [user.email]) as any[];
            if (employee) {
                await query(`UPDATE users SET employee_id = ? WHERE id = ?`, [employee.id, user.id]);
                revalidatePath('/paths/my-portal');
                return { success: true, message: `Linked to employee profile: ${employee.full_name}` };
            }
        }

        // 2. Try match by Name (Fuzzy)
        const employeesByName = await query(
            `SELECT id, full_name, designation FROM employees WHERE full_name LIKE ? LIMIT 5`,
            [`%${user.full_name}%`]
        ) as any[];

        if (employeesByName.length === 1) {
            const target = employeesByName[0];
            await query(`UPDATE users SET employee_id = ? WHERE id = ?`, [target.id, user.id]);
            revalidatePath('/paths/my-portal');
            return { success: true, message: `Linked to employee profile: ${target.full_name}` };
        }

        if (employeesByName.length > 1) {
            return {
                error: "Multiple profiles found",
                candidates: employeesByName
            };
        }

        return { error: "No matching employee profile found. Please contact HR." };

    } catch (error: any) {
        console.error("Link Profile Error:", error);
        return { error: "Failed to link profile: " + error.message };
    }
}

export async function unlinkUserProfile() {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    try {
        await query(`UPDATE users SET employee_id = NULL WHERE id = ?`, [user.id]);
        revalidatePath('/paths/my-portal');
        return { success: true, message: "Profile unlinked" };
    } catch (error: any) {
        return { error: "Failed to unlink: " + error.message };
    }
}

export async function searchEmployees(term: string) {
    const user = await getCurrentUser();
    if (!user) return { error: "Not authenticated" };

    try {
        const employees = await query(
            `SELECT id, full_name, designation, email FROM employees 
             WHERE full_name LIKE ? OR id LIKE ? OR email LIKE ?
             LIMIT 5`,
            [`%${term}%`, `%${term}%`, `%${term}%`]
        ) as any[];

        return { success: true, candidates: employees };
    } catch (error: any) {
        return { error: "Search failed: " + error.message };
    }
}
