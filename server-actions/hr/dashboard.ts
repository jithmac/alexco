"use server";

import { query } from "@/lib/db";

// Get HR dashboard stats
export async function getHRDashboardStats() {
    const [totalEmployees] = await query(`SELECT COUNT(*) as count FROM employees WHERE is_active = TRUE`) as any[];
    const [departmentCounts] = await query(`
        SELECT department, COUNT(*) as count FROM employees WHERE is_active = TRUE GROUP BY department
        `) as any[];
    const [pendingLeave] = await query(`SELECT COUNT(*) as count FROM leave_requests WHERE status = 'pending'`) as any[];
    const [pendingExpenses] = await query(`SELECT COUNT(*) as count FROM expense_claims WHERE status = 'pending'`) as any[];
    const [expiringCerts] = await query(`
        SELECT COUNT(*) as count FROM certifications WHERE expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        `) as any[];

    return {
        totalEmployees: totalEmployees?.count || 0,
        departmentCounts: departmentCounts || [],
        pendingLeaveRequests: pendingLeave?.count || 0,
        pendingExpenseClaims: pendingExpenses?.count || 0,
        expiringCertifications: expiringCerts?.count || 0
    };
}
