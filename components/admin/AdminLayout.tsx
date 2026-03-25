"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, AlertTriangle, Ticket, Users, Store, LogOut,
    Shield, CreditCard, FileText, Calendar, ShoppingBag, Settings,
    Folder, MessageSquare, Menu, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getSessionUser, logout } from "@/server-actions/auth";
import { ROLE_LABELS, UserRole } from "@/lib/auth-types";

interface AdminLayoutProps {
    children: React.ReactNode;
}

interface CurrentUser {
    id: string;
    username: string;
    full_name: string;
    role: UserRole;
    permissions: string[];
}

interface NavItem {
    href: string;
    label: string;
    icon: React.ElementType;
    roles: string[];
}

interface SidebarNavProps {
    navItems: NavItem[];
    pathname: string;
    user: CurrentUser | null;
    onClose: () => void;
    onLogout: () => void;
}

function SidebarNav({ navItems, pathname, user, onClose, onLogout }: SidebarNavProps) {
    return (
        <>
            <div className="p-6 border-b border-slate-800">
                <Link href="/" className="flex items-center gap-2" onClick={onClose}>
                    <span className="font-bold text-xl tracking-tight">
                        Alex<span className="text-blue-500">co</span> Admin
                    </span>
                </Link>
            </div>

            {user && (
                <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                    <div className="text-sm font-medium text-white">{user.full_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">@{user.username}</div>
                    <div className="mt-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-600/20 text-blue-400 rounded text-xs">
                            <Shield className="h-3 w-3" />
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1).replace('_', ' ')}
                        </span>
                    </div>
                </div>
            )}

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href ||
                        (item.href !== '/paths/admin' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <Link href="/" onClick={onClose}>
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800 gap-3">
                        <Store className="h-5 w-5" />
                        <span>Visit Store</span>
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-800 gap-3 mt-2"
                    onClick={onLogout}
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </Button>
            </div>
        </>
    );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<CurrentUser | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        async function loadUser() {
            const sessionUser = await getSessionUser();
            setUser(sessionUser as CurrentUser);
        }
        loadUser();
    }, []);

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    const allNavItems: NavItem[] = [
        { href: "/paths/my-portal", label: "My Portal", icon: LayoutDashboard, roles: [] },
        { href: "/paths/admin", label: "Dashboard", icon: LayoutDashboard, roles: ['super_user', 'admin', 'manager', 'accountant'] },
        { href: "/paths/POS", label: "POS Terminal", icon: CreditCard, roles: ['super_user', 'admin', 'manager', 'cashier'] },
        { href: "/paths/admin/inventory", label: "Inventory", icon: AlertTriangle, roles: ['super_user', 'admin', 'manager', 'technician', 'accountant', 'ecommerce_admin', 'repair_admin'] },
        { href: "/paths/admin/orders", label: "Online Orders", icon: ShoppingBag, roles: ['super_user', 'admin', 'manager', 'accountant', 'ecommerce_admin'] },
        { href: "/paths/admin/messages", label: "Messages", icon: MessageSquare, roles: ['super_user', 'admin', 'manager', 'ecommerce_admin'] },
        { href: "/paths/Ticket", label: "Job Tickets", icon: Ticket, roles: ['super_user', 'admin', 'manager', 'technician', 'repair_admin'] },

        // HR Section
        { href: "/paths/HR", label: "HR Dashboard", icon: Users, roles: ['super_user', 'admin', 'manager', 'hr_staff', 'accountant'] },
        { href: "/paths/HR/employees", label: "Employees", icon: Users, roles: ['super_user', 'admin', 'manager', 'hr_staff'] },
        { href: "/paths/HR/leave", label: "Leave Management", icon: Calendar, roles: ['super_user', 'admin', 'manager', 'hr_staff'] },
        { href: "/paths/HR/reports", label: "Payroll", icon: FileText, roles: ['super_user', 'admin', 'hr_staff', 'accountant'] },

        { href: "/paths/admin/reports", label: "Reports Hub", icon: FileText, roles: ['super_user', 'admin', 'manager', 'accountant'] },
        { href: "/paths/admin/settings/delivery", label: "Settings", icon: Settings, roles: ['super_user', 'admin'] },
        { href: "/paths/admin/categories", label: "Categories", icon: Folder, roles: ['super_user', 'admin', 'manager'] },
        { href: "/paths/admin/users", label: "User Management", icon: Shield, roles: ['super_user', 'admin'] },
        { href: "/paths/admin/users/roles", label: "Roles", icon: Shield, roles: ['super_user', 'admin'] },
    ];

    const navItems = user
        ? allNavItems.filter(item => {
            if (item.label === 'My Portal') return true;
            if (item.label === 'Dashboard') return user.permissions.includes('admin.view');
            if (item.label === 'POS Terminal') return user.permissions.includes('pos.access');
            if (item.href === '/paths/Ticket') return user.permissions.includes('tickets.manage');
            if (item.label === 'Inventory') return user.permissions.includes('inventory.view');
            if (item.label === 'Online Orders') return user.permissions.includes('ecommerce.manage');
            if (item.label === 'Messages') return user.permissions.includes('ecommerce.manage') || user.permissions.includes('admin.view');
            if (item.label === 'HR Dashboard') return user.permissions.includes('hr.view');
            if (item.label === 'Employees') return user.permissions.includes('hr.view') || user.permissions.includes('hr.manage');
            if (item.label === 'Leave Management') return user.permissions.includes('hr.view');
            if (item.label === 'Payroll') return user.permissions.includes('payroll.view') || user.permissions.includes('payroll.manage');
            if (item.label === 'Reports Hub') return user.permissions.includes('reports.view') || user.permissions.includes('admin.view');
            if (item.label === 'Settings') return user.permissions.includes('admin.settings') || user.permissions.includes('admin.manage');
            if (item.label === 'User Management') return user.permissions.includes('users.manage');
            if (item.label === 'Roles') return user.permissions.includes('users.manage');
            if (item.label === 'Categories') return user.permissions.includes('inventory.categories') || user.permissions.includes('inventory.manage');
            return false;
        })
        : [];

    const sidebarProps: SidebarNavProps = {
        navItems,
        pathname,
        user,
        onClose: () => setSidebarOpen(false),
        onLogout: handleLogout,
    };

    const isPOS = pathname === '/paths/POS';

    return (
        <div className={cn("flex min-h-screen bg-slate-100", isPOS && "flex-col md:flex-row h-screen overflow-hidden")}>
            {/* Mobile backdrop */}
            {sidebarOpen && !isPOS && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Mobile sidebar drawer */}
            {!isPOS && (
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 md:hidden",
                        sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    <button
                        className="absolute top-4 right-4 text-slate-400 hover:text-white z-10"
                        onClick={() => setSidebarOpen(false)}
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <SidebarNav {...sidebarProps} />
                </aside>
            )}

            {/* Desktop sidebar */}
            {!isPOS && (
                <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex-col hidden md:flex">
                    <SidebarNav {...sidebarProps} />
                </aside>
            )}

            {/* Main Content */}
            <main className={cn("flex-1 min-w-0", isPOS ? "flex flex-col h-full overflow-hidden" : "overflow-y-auto")}>
                {/* Mobile topbar */}
                {!isPOS && (
                    <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            aria-label="Open menu"
                            className="text-white p-1 -ml-1"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-bold flex-1">Alexco Admin</span>
                        {user && (
                            <span className="text-xs text-slate-400">{ROLE_LABELS[user.role]}</span>
                        )}
                    </div>
                )}
                <div className={cn(isPOS ? "flex-1 overflow-hidden p-0" : "p-4 md:p-8")}>
                    {children}
                </div>
            </main>
        </div>
    );
}
