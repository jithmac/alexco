"use server";

import { query } from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { getCurrentUser, requirePermission } from '@/lib/auth';

export async function submitLeaveRequest(data: any) {
    const user = await getCurrentUser();
    if (!user) return { error: "Unauthorized" };

    const { employee_id, leave_type_id, start_date, end_date, days_requested, reason } = data;

    // Self-service check
    if (user.employee_id !== employee_id) {
        // If not submitting for self, must have HR permission
        if (!user.permissions.includes('hr.manage')) {
            return { error: "Unauthorized: You can only submit leave requests for yourself." };
        }
    }

    const id = crypto.randomUUID();

    await query(`
        INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, days_requested, reason, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [id, employee_id, leave_type_id, start_date, end_date, days_requested, reason]);

    revalidatePath('/paths/HR/leave');
    revalidatePath('/paths/my-portal');
    return { success: true };
}

export async function getLeaveBalances(employeeId: string, year: number) {
    const user = await getCurrentUser();
    if (!user) return [];

    // Self-service check
    if (user.employee_id !== employeeId) {
        if (!user.permissions.includes('hr.view')) {
            throw new Error("Unauthorized");
        }
    }

    const rows = await query(`
        SELECT lt.id as type_id, lt.name, lt.code, 
               COALESCE(lb.entitled_days, 14) as entitled_days, 
               COALESCE(lb.taken_days, 0) as taken_days, 
               COALESCE(lb.pending_days, 0) as pending_days 
        FROM leave_types lt
        LEFT JOIN leave_balances lb ON lb.leave_type_id = lt.id AND lb.employee_id = ? AND lb.year = ?
    `, [employeeId, year]);
    return rows as any[];
}

export async function getPendingRequests() {
    // Only HR managers can see pending requests
    try {
        await requirePermission('hr.manage');
    } catch (e) {
        return [];
    }

    const rows = await query(`
        SELECT lr.*, e.full_name as employee_name, lt.name as leave_type
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.status = 'pending'
        ORDER BY lr.created_at ASC
    `);
    return rows as any[];
}

export async function updateLeaveStatus(requestId: string, status: 'approved' | 'rejected', approverId: string) {
    // Only HR managers can approve/reject
    try {
        await requirePermission('hr.manage');
    } catch (e) {
        throw new Error('Unauthorized: You do not have permission to approve/reject leaves');
    }

    // 1. Update request status
    await query(`
        UPDATE leave_requests 
        SET status = ?, approved_by = ?, approved_at = NOW() 
        WHERE id = ?
    `, [status, approverId, requestId]);

    if (status === 'approved') {
        // 2. Fetch request details to update balance
        const [request] = await query(`SELECT * FROM leave_requests WHERE id = ?`, [requestId]) as any[];

        if (request) {
            const year = new Date(request.start_date).getFullYear();

            // 3. Update or Insert Balance record
            // This simplistically assumes balance row exists. In production, use INSERT ... ON DUPLICATE KEY UPDATE
            // For now, let's just increment taken_days
            await query(`
                INSERT INTO leave_balances (id, employee_id, leave_type_id, year, entitled_days, taken_days)
                VALUES (UUID(), ?, ?, ?, 14, ?)
                ON DUPLICATE KEY UPDATE taken_days = taken_days + ?
            `, [request.employee_id, request.leave_type_id, year, request.days_requested, request.days_requested]);
        }
    }

    revalidatePath('/paths/HR/leave');
    return { success: true };
}

export async function getLeaveTypes() {
    const rows = await query("SELECT * FROM leave_types");
    return rows as any[];
}

export async function getAllLeaveRequests() {
    const rows = await query(`
        SELECT lr.*, e.full_name as employee_name, lt.name as leave_type
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        ORDER BY lr.created_at DESC
    `);
    return rows as any[];
}

// Get employee leave history (Moved from hr-employees.ts)
export async function getEmployeeLeaveHistory(employeeId: string) {
    const user = await getCurrentUser();
    if (!user) return [];

    // Self-service check
    if (user.employee_id !== employeeId) {
        if (!user.permissions.includes('hr.view')) {
            return [];
        }
    }

    const rows = await query(`
        SELECT lr.*, lt.name as leave_type_name
        FROM leave_requests lr
        JOIN leave_types lt ON lr.leave_type_id = lt.id
        WHERE lr.employee_id = ?
        ORDER BY lr.created_at DESC
    `, [employeeId]) as any[];
    return rows;
}
