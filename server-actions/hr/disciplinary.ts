"use server";

import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Get employee disciplinary records
export async function getDisciplinaryRecords(employeeId: string) {
    const rows = await query(
        `SELECT * FROM disciplinary_records WHERE employee_id = ? ORDER BY incident_date DESC`,
        [employeeId]
    );
    return rows as any[];
}

// Add disciplinary record
export async function addDisciplinaryRecord(employeeId: string, data: any) {
    const currentUser = await getCurrentUser();
    if (!currentUser) return { error: 'Unauthorized' };

    const id = crypto.randomUUID();
    await query(`
        INSERT INTO disciplinary_records(id, employee_id, record_type, incident_date, description, action_taken, issued_by, witness_names, employee_response)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [id, employeeId, data.record_type, data.incident_date, data.description,
        data.action_taken || null, currentUser.id, data.witness_names || null, data.employee_response || null]);
    return { success: true };
}
