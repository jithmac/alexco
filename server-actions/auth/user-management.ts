"use server";

import { query } from "@/lib/db";
import {
    hashPassword,
    getCurrentUser
} from "@/lib/auth";
import { UserRole } from "@/lib/auth-types";

// Create new user (Super User / Admin only)
export async function createUser(formData: FormData): Promise<{ error?: string; success?: boolean }> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return { error: 'Unauthorized. Only Super User or Admin can create users.' };
    }

    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole;

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

    // Get role_id from roles table
    const roles = await query(`SELECT id FROM roles WHERE slug = ?`, [role]) as any[];
    if (roles.length === 0) {
        return { error: 'Invalid role' };
    }
    const roleId = roles[0].id;

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const userId = crypto.randomUUID();

    await query(
        `INSERT INTO users (id, username, password_hash, full_name, email, role, role_id, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, username, passwordHash, fullName, email || null, role, roleId, currentUser.id]
    );

    return { success: true };
}

// Update user (Super User / Admin only)
export async function updateUser(
    userId: string,
    data: { fullName?: string; email?: string; role?: UserRole; isActive?: boolean }
): Promise<{ error?: string; success?: boolean }> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
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
        // Get role_id from roles table
        const roles = await query(`SELECT id FROM roles WHERE slug = ?`, [data.role]) as any[];
        if (roles.length > 0) {
            updates.push('role = ?');
            values.push(data.role);
            updates.push('role_id = ?');
            values.push(roles[0].id);
        }
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
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
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
// Fix Permissions (Temporary)
export async function fixPermissions() {
    try {
        // 1. Ensure all core permissions exist
        const permissions = [
            { code: 'admin.view', name: 'Access Admin Dashboard', group: 'System' },
            { code: 'admin.settings', name: 'Manage Settings', group: 'System' },
            { code: 'users.manage', name: 'Manage Users & Roles', group: 'Access' },
            { code: 'inventory.view', name: 'View Inventory', group: 'Inventory' },
            { code: 'inventory.manage', name: 'Manage Inventory', group: 'Inventory' },
            { code: 'categories.manage', name: 'Manage Categories', group: 'Inventory' },
            { code: 'pos.access', name: 'Access POS Terminal', group: 'Sales' },
            { code: 'tickets.manage', name: 'Manage Job Tickets', group: 'Service' },
            { code: 'hr.view', name: 'View HR Dashboard', group: 'HR' },
            { code: 'hr.manage', name: 'Manage Employees', group: 'HR' },
            { code: 'payroll.view', name: 'View Payroll', group: 'HR' },
            { code: 'report.view', name: 'View Reports', group: 'Reports' }
        ];

        for (const p of permissions) {
            await query(`
                INSERT INTO permissions (id, code, description, group_name) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE description = VALUES(description), group_name = VALUES(group_name)
            `, [p.code, p.code, p.name, p.group]);
        }

        // 2. Link Permissions to Super User and Admin Roles
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            SELECT r.id, p.id 
            FROM roles r, permissions p 
            WHERE r.slug IN ('super_user', 'admin') 
            AND p.code IN (
                'admin.view', 'admin.settings', 'users.manage', 'inventory.view', 
                'inventory.manage', 'categories.manage', 'pos.access', 'tickets.manage', 
                'hr.view', 'hr.manage', 'payroll.view', 'report.view'
            )
        `);

        // Add subset for HR managers
        await query(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            SELECT r.id, p.id 
            FROM roles r, permissions p 
            WHERE r.slug = 'hr_manager'
            AND p.code IN ('hr.view', 'hr.manage', 'payroll.view', 'report.view', 'admin.view')
        `);

        // 2. Add Payroll Rate Columns (Migration)
        // Check if columns exist first or use IF NOT EXISTS if supported (MySQL 8.0+)
        // Since we can't easily check version, we'll try adding them one by one in a try-catch block 
        // to avoid failing if they exist (for older MySQL)

        const columns = [
            "ADD COLUMN IF NOT EXISTS epf_employee_rate DECIMAL(5, 4) DEFAULT 0.0800",
            "ADD COLUMN IF NOT EXISTS epf_employer_rate DECIMAL(5, 4) DEFAULT 0.1200",
            "ADD COLUMN IF NOT EXISTS etf_employer_rate DECIMAL(5, 4) DEFAULT 0.0300"
        ];

        try {
            // Try valid MySQL 8.0+ syntax first
            await query(`
                ALTER TABLE employees 
                ADD COLUMN IF NOT EXISTS epf_employee_rate DECIMAL(5, 4) DEFAULT 0.0800,
                ADD COLUMN IF NOT EXISTS epf_employer_rate DECIMAL(5, 4) DEFAULT 0.1200,
                ADD COLUMN IF NOT EXISTS etf_employer_rate DECIMAL(5, 4) DEFAULT 0.0300
            `);
        } catch (e: any) {
            // Fallback for older MySQL: Try adding individually, ignore duplicate column errors
            console.log("Bulk alter failed, trying individual columns...");
            for (const col of columns) {
                try {
                    await query(`ALTER TABLE employees ${col.replace('IF NOT EXISTS', '')}`);
                } catch (err: any) {
                    // Ignore "Duplicate column name" error (Code 1060)
                    if (err.code !== 'ER_DUP_FIELDNAME' && err.errno !== 1060) {
                        console.error(`Failed to add column: ${col}`, err);
                    }
                }
            }
        }

        // 3. Fix User Roles (Sync role_id)
        const allUsers = await query(`SELECT id, role FROM users`) as any[];
        const allRoles = await query(`SELECT id, slug FROM roles`) as any[];
        
        for (const user of allUsers) {
            const userRoleSlug = user.role?.toLowerCase()?.replace('_', '-');
            const targetRole = allRoles.find(r => r.slug === userRoleSlug || r.slug === user.role);
            
            if (targetRole) {
                await query(`UPDATE users SET role_id = ?, role = ? WHERE id = ?`, [targetRole.id, targetRole.slug, user.id]);
            }
        }

        return { success: true };
    } catch (error: any) {
        console.error("Fix Permissions Error:", error);
        return { error: error.message };
    }
}
export async function getAllUsers(): Promise<any[]> {
    const currentUser = await getCurrentUser();

    if (!currentUser || (currentUser.role !== 'super_user' && currentUser.role !== 'admin')) {
        return [];
    }

    const rows = await query(
        `SELECT u.id, u.username, u.full_name, u.email, u.is_active, u.created_at, u.last_login,
                COALESCE(r.name, u.role) as role,
                e.employee_number, e.designation
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         LEFT JOIN employees e ON u.id = e.user_id
         ORDER BY u.created_at DESC`
    ) as any[];

    return rows;
}
