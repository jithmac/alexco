"use server";

import { query } from "@/lib/db";
import { getCurrentUser, hashPassword } from "@/lib/auth";

// Create user account for employee
export async function createEmployeeUserAccount(employeeId: string, data: any) {
    const currentUser = await getCurrentUser();
    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return { error: 'Unauthorized' };
    }

    const { username, password, role } = data;

    // Check if employee already has a user
    const emp = await query(`SELECT user_id, email, full_name FROM employees WHERE id = ?`, [employeeId]) as any[];
    if (emp[0].user_id) return { error: 'Employee already has a user account' };

    // Check username
    const existing = await query(`SELECT id FROM users WHERE username = ?`, [username]) as any[];
    if (existing.length > 0) return { error: 'Username already taken' };

    const userId = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    // Get role_id from roles table
    const roles = await query(`SELECT id FROM roles WHERE slug = ?`, [role]) as any[];
    if (roles.length === 0) {
        return { error: 'Invalid role selected' };
    }
    const roleId = roles[0].id;

    // Create User
    await query(`
        INSERT INTO users (id, username, password_hash, full_name, email, role, role_id, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [userId, username, passwordHash, emp[0].full_name, emp[0].email, role, roleId, currentUser.id]);

    // Link to Employee
    await query(`UPDATE employees SET user_id = ? WHERE id = ?`, [userId, employeeId]);

    return { success: true };
}

// Get linked user details
export async function getEmployeeUser(employeeId: string) {
    const rows = await query(`
        SELECT u.id, u.username, u.role, u.is_active, u.last_login 
        FROM employees e 
        JOIN users u ON e.user_id = u.id 
        WHERE e.id = ?
    `, [employeeId]) as any[];
    return rows[0] || null;
}
