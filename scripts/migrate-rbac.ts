
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { ROLE_LABELS, UserRole } from '../lib/auth-types';

dotenv.config({ path: '.env.local' });

async function migrateRBAC() {
    console.log('🚀 Starting RBAC Migration...');

    // Dynamic import
    const { pool } = await import('../lib/db');
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Create Tables
        console.log('📦 Creating Tables...');

        await connection.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id CHAR(36) PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                slug VARCHAR(50) UNIQUE NOT NULL,
                description TEXT,
                is_system BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS permissions (
                id CHAR(36) PRIMARY KEY,
                code VARCHAR(100) UNIQUE NOT NULL,
                description TEXT,
                group_name VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        await connection.query(`
            CREATE TABLE IF NOT EXISTS role_permissions (
                role_id CHAR(36),
                permission_id CHAR(36),
                PRIMARY KEY (role_id, permission_id),
                FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
                FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
            )
        `);

        // 2. Define Permissions (Normalized from auth-types)
        // We need to convert the PERMISSIONS object structure into a flat list of permission codes
        const permissionCodes = [
            { code: 'pos.access', group: 'POS', desc: 'Access POS Terminal' },
            { code: 'tickets.manage', group: 'Tickets', desc: 'Manage Job Tickets' },

            { code: 'inventory.view', group: 'Inventory', desc: 'View Inventory' },
            { code: 'inventory.manage', group: 'Inventory', desc: 'Manage Inventory (Add/Edit/Audits)' },

            { code: 'hr.view', group: 'HR', desc: 'View HR Dashboard' },
            { code: 'hr.manage', group: 'HR', desc: 'Manage Employees & Payroll' },

            { code: 'admin.view', group: 'Admin', desc: 'View Admin Dashboard' },
            { code: 'admin.manage', group: 'Admin', desc: 'Full Admin Access' },

            { code: 'ecommerce.manage', group: 'E-commerce', desc: 'Manage Online Orders' },

            { code: 'users.manage', group: 'System', desc: 'Manage Users & Roles' },
        ];

        console.log('🔑 Seeding Permissions...');
        const permMap = new Map<string, string>(); // code -> id

        for (const p of permissionCodes) {
            const [rows] = await connection.query("SELECT id FROM permissions WHERE code = ?", [p.code]);
            let pId;
            if ((rows as any[]).length === 0) {
                pId = uuidv4();
                await connection.query(
                    "INSERT INTO permissions (id, code, description, group_name) VALUES (?, ?, ?, ?)",
                    [pId, p.code, p.desc, p.group]
                );
            } else {
                pId = (rows as any[])[0].id;
            }
            permMap.set(p.code, pId);
        }

        // 3. Seed Roles & Assign Permissions
        console.log('👥 Seeding Roles...');
        const roleMap = new Map<string, string>(); // slug -> id

        // Map existing hardcoded roles to new Permission Codes
        // Based on lib/auth.ts PERMISSIONS logic
        const roleDefinitions: Record<string, string[]> = {
            super_user: ['pos.access', 'tickets.manage', 'inventory.manage', 'inventory.view', 'hr.manage', 'hr.view', 'admin.manage', 'admin.view', 'ecommerce.manage', 'users.manage'],
            admin: ['pos.access', 'tickets.manage', 'inventory.manage', 'inventory.view', 'hr.manage', 'hr.view', 'admin.manage', 'admin.view', 'users.manage'], // Removed ecommerce based on lib/auth.ts:49
            manager: ['pos.access', 'tickets.manage', 'inventory.manage', 'inventory.view', 'hr.view'],
            cashier: ['pos.access'],
            technician: ['tickets.manage', 'inventory.view'],
            hr_staff: ['hr.manage', 'hr.view'],
            accountant: ['inventory.view', 'hr.manage', 'hr.view', 'admin.view'],
            ecommerce_admin: ['inventory.view', 'ecommerce.manage'],
            repair_admin: ['tickets.manage', 'inventory.manage', 'inventory.view'],
        };

        for (const [slug, label] of Object.entries(ROLE_LABELS)) {
            const [rows] = await connection.query("SELECT id FROM roles WHERE slug = ?", [slug]);
            let rId;
            if ((rows as any[]).length === 0) {
                rId = uuidv4();
                await connection.query(
                    "INSERT INTO roles (id, name, slug, description, is_system) VALUES (?, ?, ?, ?, ?)",
                    [rId, label, slug, `System role: ${label}`, true]
                );
            } else {
                rId = (rows as any[])[0].id;
            }
            roleMap.set(slug, rId);

            // Assign permissions
            const perms = roleDefinitions[slug] || [];
            if (perms.length > 0) {
                // Clear existing
                await connection.query("DELETE FROM role_permissions WHERE role_id = ?", [rId]);

                for (const pCode of perms) {
                    const pId = permMap.get(pCode);
                    if (pId) {
                        await connection.query(
                            "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
                            [rId, pId]
                        );
                    }
                }
            }
        }

        // 4. Update Users Table
        console.log('👤 Updating Users Table...');

        // Check if role_id column exists
        const [cols] = await connection.query("SHOW COLUMNS FROM users LIKE 'role_id'");
        if ((cols as any[]).length === 0) {
            await connection.query("ALTER TABLE users ADD COLUMN role_id CHAR(36)");
            await connection.query("ALTER TABLE users ADD CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)");
            console.log("   + Added role_id column");
        }

        // Migrate users
        console.log('🔄 Migrating User Roles...');
        const [users] = await connection.query("SELECT id, role FROM users WHERE role_id IS NULL");

        for (const u of (users as any[])) {
            if (u.role && roleMap.has(u.role)) {
                await connection.query(
                    "UPDATE users SET role_id = ? WHERE id = ?",
                    [roleMap.get(u.role), u.id]
                );
            }
        }

        await connection.commit();
        console.log('✅ RBAC Migration Complete!');

    } catch (e) {
        await connection.rollback();
        console.error('❌ Migration Failed:', e);
        throw e;
    } finally {
        connection.end();
        process.exit(0);
    }
}

migrateRBAC();
