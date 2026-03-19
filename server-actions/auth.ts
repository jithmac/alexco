"use server";

import { query } from "@/lib/db";
import {
    hashPassword,
    verifyPassword,
    createSession,
    destroySession,
    getCurrentUser,
    requirePermission,
    User
} from "@/lib/auth";
import { UserRole } from "@/lib/auth-types";
import { redirect } from "next/navigation";

// Login action
export async function login(formData: FormData): Promise<{ error?: string; success?: boolean; role?: string }> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    // Find user
    const rows = await query(
        `SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.is_active,
                COALESCE(r.slug, u.role) as role
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.username = ?`,
        [username]
    ) as any[];

    const user = rows[0];

    if (!user) {
        return { error: 'Invalid username or password' };
    }

    if (!user.is_active) {
        return { error: 'Account is deactivated. Contact administrator.' };
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
        return { error: 'Invalid username or password' };
    }

    // Create session
    await createSession({
        id: user.id,
        username: user.username,
        role: user.role
    });

    console.log('Login successful for:', username, 'Role:', user.role);
    return { success: true, role: user.role };
}

// Logout action
export async function logout(): Promise<void> {
    await destroySession();
    redirect('/login');
}

// Get current session user
export async function getSessionUser(): Promise<User | null> {
    return getCurrentUser();
}

// Create new user (Super User / Admin only)
export async function createUser(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    let currentUser;
    try {
        currentUser = await requirePermission('users.manage');
    } catch (e) {
        return { error: 'Unauthorized: Insufficient permissions' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole;
    const manualEmployeeId = formData.get('employeeId') as string; // Optional manual link

    if (!username || !password || !fullName || !role) {
        return { error: 'All required fields must be filled' };
    }

    if (password.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    // Check if username exists
    const existing = await query(
        `SELECT id FROM users WHERE username = ?`,
        [username]
    ) as any[];

    if (existing.length > 0) {
        return { error: 'Username already exists' };
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    // Auto-link Logic
    let employeeId = null;

    // 0. Manual Employee ID (highest priority)
    if (manualEmployeeId) {
        const [emp] = await query(`SELECT id FROM employees WHERE id = ?`, [manualEmployeeId]) as any[];
        if (emp) employeeId = emp.id;
    }

    // 1. Try email match
    if (!employeeId && email) {
        const [empByEmail] = await query(`SELECT id FROM employees WHERE email = ?`, [email]) as any[];
        if (empByEmail) employeeId = empByEmail.id;
    }

    // 2. Try exact name match if no email match
    if (!employeeId) {
        const empsByName = await query(`SELECT id FROM employees WHERE full_name = ?`, [fullName]) as any[];
        if (empsByName.length === 1) {
            employeeId = empsByName[0].id;
        }
    }

    await query(
        `INSERT INTO users (id, username, password_hash, full_name, email, role, created_by, employee_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, passwordHash, fullName, email || null, role, currentUser.id, employeeId]
    );

    return { success: true };
}

// Update user (Super User / Admin only)
export async function updateUser(
    userId: string,
    data: { fullName?: string; email?: string; role?: UserRole; isActive?: boolean }
): Promise<{ error?: string; success?: boolean }> {
    try {
        await requirePermission('users.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (data.fullName) {
        updates.push('full_name = ?');
        values.push(data.fullName);
    }
    if (data.email !== undefined) {
        updates.push('email = ?');
        values.push(data.email || null);
    }
    if (data.role) {
        updates.push('role = ?');
        values.push(data.role);
    }
    if (data.isActive !== undefined) {
        updates.push('is_active = ?');
        values.push(data.isActive);
    }

    if (updates.length === 0) {
        return { error: 'No fields to update' };
    }

    values.push(userId);
    await query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
    );

    return { success: true };
}

// Reset password (Super User / Admin only)
export async function resetPassword(userId: string, newPassword: string): Promise<{ error?: string; success?: boolean }> {
    try {
        await requirePermission('users.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    if (newPassword.length < 6) {
        return { error: 'Password must be at least 6 characters' };
    }

    const passwordHash = await hashPassword(newPassword);
    await query(
        `UPDATE users SET password_hash = ? WHERE id = ?`,
        [passwordHash, userId]
    );

    return { success: true };
}

// Get all users (for management UI)
export async function getAllUsers(): Promise<any[]> {
    try {
        await requirePermission('users.manage');
    } catch (e) {
        return [];
    }

    const rows = await query(
        `SELECT id, username, full_name, email, role, is_active, created_at, last_login 
         FROM users ORDER BY created_at DESC`
    ) as any[];

    return rows;
}
