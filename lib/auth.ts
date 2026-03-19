import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';
import { cookies } from 'next/headers';
import { UserRole } from './auth-types';

// JWT secret - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'alexco-secret-key-change-in-production';
const SESSION_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

export interface User {
    id: string;
    username: string;
    full_name: string;
    email: string | null;
    role: string; // Now a string from DB (slug)
    role_id: string;
    is_active: boolean;
    employee_id?: string | null;
    permissions: string[]; // List of permission codes
}

export interface SessionPayload {
    userId: string;
    username: string;
    role: string;
    exp: number;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

// Subset of User needed for session creation
export type TokenUser = Pick<User, 'id' | 'username' | 'role'>;

// JWT Token management
export function createToken(user: TokenUser): string {
    const payload: SessionPayload = {
        userId: user.id,
        username: user.username,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + SESSION_EXPIRY,
    };
    return jwt.sign(payload, JWT_SECRET);
}

export function verifyToken(token: string): SessionPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as SessionPayload;
    } catch {
        return null;
    }
}

// Session management using cookies
export async function createSession(user: TokenUser): Promise<string> {
    const token = createToken(user);

    // Store session in database
    const sessionId = crypto.randomUUID();
    const tokenHash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY * 1000);

    await query(
        `INSERT INTO user_sessions (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)`,
        [sessionId, user.id, tokenHash, expiresAt]
    );

    // Update last login
    await query(`UPDATE users SET last_login = NOW() WHERE id = ?`, [user.id]);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: SESSION_EXPIRY,
        path: '/',
    });

    return token;
}

export async function destroySession(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            // Delete all sessions for this user
            await query(`DELETE FROM user_sessions WHERE user_id = ?`, [payload.userId]);
        }
    }

    cookieStore.delete('auth_token');
}

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) return null;

    const payload = verifyToken(token);
    if (!payload) return null;

    // Fetch user from database with Role Slug
    const users = await query(`
        SELECT u.id, u.username, u.full_name, u.email, u.is_active, u.employee_id, u.role_id,
               u.role as legacy_role, r.slug as role_slug
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        WHERE u.id = ? AND u.is_active = TRUE
    `, [payload.userId]) as any[];

    if (users.length === 0) return null;

    const user = users[0];
    const roleSlug = user.role_slug || user.legacy_role || 'guest';
    let roleId = user.role_id;

    // If role_id is missing, try to find it by slug for backward compatibility/sync
    if (!roleId && roleSlug !== 'guest') {
        const roles = await query(`SELECT id FROM roles WHERE slug = ?`, [roleSlug]) as any[];
        if (roles.length > 0) {
            roleId = roles[0].id;
            // Proactively update user with role_id if found
            await query(`UPDATE users SET role_id = ? WHERE id = ?`, [roleId, user.id]);
        }
    }

    // Fetch Permissions
    const permissions = roleId ? await query(`
        SELECT p.code 
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
    `, [roleId]) as any[] : [];

    return {
        ...user,
        role: roleSlug,
        role_id: roleId,
        permissions: permissions.map(p => p.code)
    };
}

// Check access helper
export function canAccess(user: User | null, permissionCode: string): boolean {
    if (!user) return false;
    return user.permissions.includes(permissionCode);
}

// Server-side permission enforcement
export async function requirePermission(permission: string): Promise<User> {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }
    if (!user.permissions.includes(permission)) {
        throw new Error(`Forbidden: Missing permission ${permission}`);
    }
    return user;
}

// Deprecated: Route checking should now rely on the user object in the component or middleware
// But we keep a helper for server-side checks if needed
export function checkRouteAccess(user: User | null, path: string): boolean {
    if (!user) return false;

    // Super User bypass
    if (user.role === 'super_user') return true;

    // Map paths to required permissions
    const routePermissions: Record<string, string> = {
        '/paths/POS': 'pos.access',
        '/paths/Ticket': 'tickets.manage',
        '/paths/admin/inventory': 'inventory.view',
        '/paths/admin/users': 'users.manage',
        '/paths/admin/categories': 'inventory.view',
        '/paths/admin/reports': 'report.view',
        '/paths/HR': 'hr.view'
    };

    // Check for exact or prefix matches
    for (const [route, permission] of Object.entries(routePermissions)) {
        if (path.startsWith(route)) {
            return user.permissions.includes(permission);
        }
    }

    // Admin dashboard specific check
    if (path.startsWith('/paths/admin')) {
        return user.permissions.includes('admin.view');
    }

    return true; // Public or unlisted routes
}
