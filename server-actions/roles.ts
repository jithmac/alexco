
'use server';

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from 'uuid';

export interface UserRoleData {
    id: string;
    name: string;
    slug: string;
    description: string;
    is_system: boolean;
    permissions: string[]; // List of permission codes
}

export async function getRoles() {
    const roles = await query(`
        SELECT r.*, 
               GROUP_CONCAT(p.code) as permission_codes
        FROM roles r
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        GROUP BY r.id
        ORDER BY r.name
    `) as any[];

    return roles.map(r => ({
        ...r,
        permissions: r.permission_codes ? r.permission_codes.split(',') : []
    }));
}

export async function getRole(id: string) {
    const roles = await query(`SELECT * FROM roles WHERE id = ?`, [id]) as any[];
    if (roles.length === 0) return null;

    const role = roles[0];
    const permissions = await query(`
        SELECT p.code 
        FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role_id = ?
    `, [id]) as any[];

    return {
        ...role,
        permissions: permissions.map(p => p.code)
    };
}

export async function createRole(data: { name: string; description: string; permissions: string[] }) {
    const id = uuidv4();
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // Check if slug exists
    const existing = await query(`SELECT id FROM roles WHERE slug = ?`, [slug]) as any[];
    if (existing.length > 0) {
        throw new Error("A role with this name already exists.");
    }

    // Insert Role
    await query(
        `INSERT INTO roles (id, name, slug, description) VALUES (?, ?, ?, ?)`,
        [id, data.name, slug, data.description]
    );

    // Insert Permissions
    if (data.permissions && data.permissions.length > 0) {
        // Get permission IDs
        const placeholders = data.permissions.map(() => '?').join(',');
        const perms = await query(`SELECT id FROM permissions WHERE code IN (${placeholders})`, data.permissions) as any[];

        for (const p of perms) {
            await query(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [id, p.id]);
        }
    }

    revalidatePath('/paths/admin/users/roles');
    return { success: true, id };
}

export async function updateRole(id: string, data: { name: string; description: string; permissions: string[] }) {
    const roles = await query(`SELECT is_system FROM roles WHERE id = ?`, [id]) as any[];
    if (roles.length === 0) throw new Error("Role not found");

    // Don't allow changing name of system roles to prevent slug mismatch issues for core logic (optional, but safer)
    /* if (roles[0].is_system) {
        // Allow updating description and permissions only? 
        // For now, let's allow name change but keep slug same or strict update.
    } */

    await query(
        `UPDATE roles SET name = ?, description = ? WHERE id = ?`,
        [data.name, data.description, id]
    );

    // Update Permissions
    // 1. Remove all old
    await query(`DELETE FROM role_permissions WHERE role_id = ?`, [id]);

    // 2. Add new
    if (data.permissions && data.permissions.length > 0) {
        const placeholders = data.permissions.map(() => '?').join(',');
        const perms = await query(`SELECT id FROM permissions WHERE code IN (${placeholders})`, data.permissions) as any[];

        for (const p of perms) {
            await query(`INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)`, [id, p.id]);
        }
    }

    revalidatePath('/paths/admin/users/roles');
    return { success: true };
}

export async function deleteRole(id: string) {
    const roles = await query(`SELECT is_system FROM roles WHERE id = ?`, [id]) as any[];
    if (roles.length === 0) throw new Error("Role not found");
    if (roles[0].is_system) throw new Error("Cannot delete system roles.");

    await query(`DELETE FROM roles WHERE id = ?`, [id]);
    revalidatePath('/paths/admin/users/roles');
    return { success: true };
}

export async function getAllPermissions() {
    return await query(`SELECT * FROM permissions ORDER BY group_name, code`) as any[];
}
