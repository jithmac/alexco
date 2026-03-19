"use server";

import { query } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Get Clock-in status (Last log for today)
export async function getTodayAttendance() {
    const user = await getCurrentUser();
    if (!user) return null;

    // Find employee linked to user
    const empRows = await query(`SELECT id FROM employees WHERE user_id = ?`, [user.id]) as any[];
    if (empRows.length === 0) return null; // Not an employee

    const employeeId = empRows[0].id;

    const rows = await query(`
        SELECT * FROM attendance_logs 
        WHERE employee_id = ? AND date = CURDATE()
    `, [employeeId]) as any[];

    return rows[0] || null;
}

// Clock In Action
export async function clockIn(data: any) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    const empRows = await query(`SELECT id FROM employees WHERE user_id = ?`, [user.id]) as any[];
    if (empRows.length === 0) return { error: 'Employee profile not found' };

    const employeeId = empRows[0].id;
    const { latitude, longitude, source } = data;
    const id = crypto.randomUUID();

    try {
        await query(`
            INSERT INTO attendance_logs (id, employee_id, date, check_in, check_in_source, check_in_latitude, check_in_longitude)
            VALUES (?, ?, CURDATE(), NOW(), ?, ?, ?)
        `, [id, employeeId, source || 'mobile', latitude || null, longitude || null]);
        return { success: true };
    } catch (e: any) {
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'Already clocked in today' };
        }
        throw e;
    }
}

// Clock Out Action
export async function clockOut(data: any) {
    const user = await getCurrentUser();
    if (!user) return { error: 'Unauthorized' };

    const empRows = await query(`SELECT id FROM employees WHERE user_id = ?`, [user.id]) as any[];
    if (empRows.length === 0) return { error: 'Employee profile not found' };

    const employeeId = empRows[0].id;
    const { latitude, longitude, source } = data;

    await query(`
        UPDATE attendance_logs 
        SET check_out = NOW(), 
            check_out_source = ?, 
            check_out_latitude = ?, 
            check_out_longitude = ?
        WHERE employee_id = ? AND date = CURDATE()
    `, [source || 'mobile', latitude || null, longitude || null, employeeId]);

    // Calculate OT automatically on clock out
    // Fetch this log to calculate hours
    const logRows = await query(`SELECT check_in, check_out FROM attendance_logs WHERE employee_id = ? AND date = CURDATE()`, [employeeId]) as any[];
    if (logRows.length > 0) {
        const log = logRows[0];
        const checkIn = new Date(log.check_in);
        const checkOut = new Date(log.check_out);
        const hoursWorked = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

        // Simple OT logic: > 9 hours (including 1hr break)
        if (hoursWorked > 9) {
            const otHours = hoursWorked - 9;
            await query(`UPDATE attendance_logs SET ot_hours = ? WHERE employee_id = ? AND date = CURDATE()`, [otHours, employeeId]);
        }
    }

    return { success: true };
}

// Get Roster for Employee
export async function getMyRoster(month: number, year: number) {
    const user = await getCurrentUser();
    if (!user) return [];

    const empRows = await query(`SELECT id FROM employees WHERE user_id = ?`, [user.id]) as any[];
    if (empRows.length === 0) return [];

    const employeeId = empRows[0].id;
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const rows = await query(`
        SELECT r.date, s.name as shift_name, s.start_time, s.end_time, r.is_day_off
        FROM rosters r
        LEFT JOIN shifts s ON r.shift_id = s.id
        WHERE r.employee_id = ? AND r.date BETWEEN ? AND ?
        ORDER BY r.date
    `, [employeeId, startDate, endDate]) as any[];

    return rows;
}
