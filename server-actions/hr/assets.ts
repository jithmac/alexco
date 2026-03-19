"use server";

import { query } from "@/lib/db";

// Get employee assets
export async function getEmployeeAssets(employeeId: string) {
    const rows = await query(
        `SELECT * FROM employee_assets WHERE employee_id = ? AND returned_date IS NULL ORDER BY assigned_date DESC`,
        [employeeId]
    );
    return rows as any[];
}

// Add asset to employee
export async function assignAsset(employeeId: string, data: any) {
    const id = crypto.randomUUID();
    await query(`
        INSERT INTO employee_assets(id, employee_id, asset_type, asset_name, asset_code, description, assigned_date, condition_on_issue, notes)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [id, employeeId, data.asset_type, data.asset_name, data.asset_code || null, data.description || null,
        data.assigned_date, data.condition_on_issue || 'good', data.notes || null]);
    return { success: true };
}

// Return asset
export async function returnAsset(assetId: string, condition: string, notes?: string) {
    await query(`
        UPDATE employee_assets SET returned_date = CURDATE(), condition_on_return = ?, notes = ?
        WHERE id = ?
            `, [condition, notes || null, assetId]);
    return { success: true };
}
