// Client-safe auth types and constants
// This module can be imported in both client and server components

// Role definitions (now just strings, but keeping union for legacy type safety if needed, 
// though dynamic roles make this union less strict)
export type UserRole = string;

export interface User {
    id: string;
    username: string;
    full_name: string;
    email: string | null;
    role: string;
    role_id: string;
    permissions: string[];
    is_active: boolean;
}

export interface SessionPayload {
    userId: string;
    username: string;
    role: string; // slug
    exp: number;
}

// Default Role Labels (for initial display or fallback)
// Ideally this should come from DB now
export const ROLE_LABELS: Record<string, string> = {
    super_user: 'Super User',
    admin: 'Admin',
    manager: 'Manager',
    cashier: 'Cashier',
    technician: 'Technician',
    hr_staff: 'HR Staff',
    accountant: 'Accountant',
    ecommerce_admin: 'E-commerce Admin',
    repair_admin: 'Repair Center Admin',
};

// Permission checking helper (client-safe)
export function hasPermission(user: User | null, code: string): boolean {
    return user?.permissions?.includes(code) ?? false;
}

// Get allowed routes based on permissions (not role)
export function getAllowedRoutes(permissions: string[]): { href: string; label: string; icon: string }[] {
    const routes: { href: string; label: string; icon: string }[] = [];
    const has = (code: string) => permissions.includes(code);

    if (has('admin.view')) routes.push({ href: '/paths/admin', label: 'Dashboard', icon: '📊' });
    if (has('pos.access')) routes.push({ href: '/paths/POS', label: 'POS Terminal', icon: '💳' });
    if (has('tickets.manage')) routes.push({ href: '/paths/Ticket', label: 'Job Tickets', icon: '🔧' });
    if (has('inventory.view')) routes.push({ href: '/paths/admin/inventory', label: 'Inventory', icon: '📦' });

    if (has('hr.view')) {
        routes.push({ href: '/paths/HR', label: 'HR Dashboard', icon: '👥' });
        routes.push({ href: '/paths/HR/employees', label: 'Employees', icon: '📋' });
        routes.push({ href: '/paths/HR/attendance', label: 'Attendance', icon: '🕒' });
        routes.push({ href: '/paths/HR/leave', label: 'Leave', icon: '🏖️' });
        routes.push({ href: '/paths/HR/reports', label: 'Payroll & Reports', icon: '📄' });
        routes.push({ href: '/paths/HR/performance', label: 'Performance', icon: '📈' });
        routes.push({ href: '/paths/HR/expenses', label: 'Expenses', icon: '💰' });
        routes.push({ href: '/paths/HR/recruitment', label: 'Recruitment', icon: '🤝' });
    }

    if (has('users.manage')) {
        routes.push({ href: '/paths/admin/users', label: 'User Management', icon: '🔐' });
        routes.push({ href: '/paths/admin/users/roles', label: 'Roles', icon: '🎭' });
    }

    return routes;
}
