import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, Users, ShoppingCart, Wallet } from "lucide-react";
import InventoryAlerts from "@/components/admin/InventoryAlerts";
import { getDashboardStats } from "@/server-actions/admin/dashboard";

// Prevent static prerendering - requires authentication
export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
                <span className="text-sm text-slate-500">Welcome back, Admin</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sales (Today)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">LKR {stats.todaySales.toLocaleString()}</div>
                        <p className={`text-xs ${Number(stats.salesPercentage) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {Number(stats.salesPercentage) >= 0 ? '+' : ''}{stats.salesPercentage}% from yesterday
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Tickets</CardTitle>
                        <AlertCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.activeTickets}</div>
                        <p className="text-xs text-slate-500">{stats.pendingTickets} pending attention</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.lowStockItems}</div>
                        <p className="text-xs text-slate-500">Items below threshold</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Online Orders</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.onlineOrders}</div>
                        <p className="text-xs text-slate-500">{stats.toShipOrders} to ship</p>
                    </CardContent>
                </Card>
            </div>

            {/* Inventory Alerts */}
            <div className="mt-8">
                <InventoryAlerts />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>HR & Employees</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href="/paths/HR">
                            <Button variant="outline" className="w-full justify-start gap-2 bg-blue-50/50 hover:bg-blue-50 border-blue-100">
                                <Wallet className="h-4 w-4 text-blue-600" />
                                Payroll Engine
                            </Button>
                        </Link>
                        <Link href="/paths/HR/leave">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Calendar className="h-4 w-4" />
                                Manage Leave Requests
                            </Button>
                        </Link>
                        <Link href="/paths/HR/employees">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Users className="h-4 w-4" />
                                Employee Directory
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>System & Users</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                        <Link href="/paths/admin/users">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <Users className="h-4 w-4" />
                                User Management
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
