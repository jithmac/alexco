"use server";

import { query } from "@/lib/db";
import {
    verifyPassword,
    createSession,
    destroySession,
    getCurrentUser,
    User
} from "@/lib/auth";
import { UserRole } from "@/lib/auth-types";
import { redirect } from "next/navigation";

// Login action
export async function login(formData: FormData): Promise<{ error?: string; success?: boolean; role?: UserRole; permissions?: string[] }> {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    // Find user with role from roles table
    const rows = await query(
        `SELECT u.id, u.username, u.password_hash, u.full_name, u.email, u.is_active,
                COALESCE(r.slug, u.role) as role, u.role_id
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

    // Fetch permissions for smart redirection
    const permissions = await query(`
        SELECT p.code 
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
    `, [user.role_id]) as any[];

    return {
        success: true,
        role: user.role,
        permissions: permissions.map(p => p.code)
    };
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
