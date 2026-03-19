"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getLeaveBalances, getEmployeeLeaveHistory, getLeaveTypes } from "@/server-actions/hr/leave";
import { getSessionUser } from "@/server-actions/auth";
import { Plus, Calendar, Megaphone, FileText, Eye } from "lucide-react";
import { BalanceCard } from "@/components/hr/leave/BalanceCard";
import { LeaveRequestForm } from "@/components/hr/leave/LeaveRequestForm";
import { PayslipModal } from "@/components/hr/PayslipModal";
import Link from "next/link";

export default function MyPortalPage() {
    const [user, setUser] = useState<any>(null);
    const [balances, setBalances] = useState<any[]>([]);
    const [history, setHistory] = useState<any[]>([]);
    const [leaveTypes, setLeaveTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        const currentUser = await getSessionUser();
        setUser(currentUser);

        if (currentUser && currentUser.employee_id) {
            const year = new Date().getFullYear();

            // Parallel fetch
            const [bals, hist, types] = await Promise.all([
                getLeaveBalances(currentUser.employee_id, year),
                getEmployeeLeaveHistory(currentUser.employee_id),
                getLeaveTypes()
            ]);

            setBalances(bals);
            setHistory(hist.slice(0, 5)); // Top 5
            setLeaveTypes(types);
        }
        setLoading(false);
    }

    if (loading) return <div className="p-8">Loading your portal...</div>;

    if (!user) return <div className="p-8">Please log in.</div>;

    if (!user.employee_id) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Profile Not Linked</h2>
                <p className="mt-2 max-w-md">
                    Your user account is not linked to an employee profile.
                </p>

                <div className="mt-6 flex flex-col gap-2">
                    <form action={async () => {
                        const { linkUserProfile } = await import("@/server-actions/auth/link-profile");
                        const result = await linkUserProfile();
                        if (result.success) {
                            alert(result.message);
                            window.location.reload();
                        } else {
                            alert(result.error);
                        }
                    }}>
                        <Button type="submit" variant="outline" className="gap-2">
                            <Plus className="h-4 w-4" /> Attempt Auto-Link
                        </Button>
                    </form>
                    <p className="text-xs text-slate-400 mt-2">
                        Matches your email ({user.email || 'N/A'}) or name against employee records.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Hello, {user.full_name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-500 mt-1">Welcome to your personal dashboard.</p>
                </div>
                <div className="flex gap-2">
                    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                        <SheetTrigger asChild>
                            <Button className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" /> Request Leave
                            </Button>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Request Leave</SheetTitle>
                            </SheetHeader>
                            <LeaveRequestForm
                                leaveTypes={leaveTypes}
                                employeeId={user.employee_id}
                                onSuccess={() => {
                                    setIsSheetOpen(false);
                                    loadData();
                                }}
                            />
                        </SheetContent>
                    </Sheet>
                </div>
            </div>

            {/* Leave Balances */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                    <Calendar className="h-4 w-4" /> My Leave Balance
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {balances.map((b, i) => (
                        <BalanceCard key={i} type={b.name} balance={b.entitled_days} taken={b.taken_days} />
                    ))}
                    {balances.length === 0 && (
                        <div className="col-span-4 p-6 border border-dashed rounded-lg text-center text-slate-400">
                            No leave balances assigned for this year.
                        </div>
                    )}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        <FileText className="h-4 w-4" /> Recent Requests
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-slate-50 text-slate-500 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Dates</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {history.map(req => (
                                        <tr key={req.id} className="hover:bg-slate-50/50">
                                            <td className="px-4 py-3 font-medium">{req.leave_type_name}</td>
                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(req.start_date).toLocaleDateString()} - {new Date(req.end_date).toLocaleDateString()}
                                                <span className="text-xs ml-2 bg-slate-100 px-1.5 py-0.5 rounded">
                                                    {req.days_requested}d
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                                                    ${req.status === 'approved' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
                                                        req.status === 'rejected' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
                                                            'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {history.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                                                No recent leave requests.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Related Content / Announcements */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        <Megaphone className="h-4 w-4" /> Announcements
                    </div>
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-blue-900 mb-1">Office Policy Update</h3>
                            <p className="text-sm text-blue-700 mb-3">
                                Please review the updated remote work policy effective from next month.
                            </p>
                            <Button variant="outline" size="sm" className="w-full bg-white text-blue-700 border-blue-200 hover:bg-blue-50">
                                Read More
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-slate-800 mb-1">System Maintenance</h3>
                            <p className="text-sm text-slate-600">
                                Scheduled maintenance on Saturday 10 PM.
                            </p>
                        </CardContent>
                    </Card>

                    {/* My Payslips Card */}
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-green-900 mb-1 flex items-center gap-2">
                                <FileText className="h-4 w-4 text-green-600" /> My Payslips
                            </h3>
                            <p className="text-sm text-green-700 mb-3">
                                Your January 2026 payslip is ready for review.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-white text-green-700 border-green-200 hover:bg-green-50 gap-2"
                                onClick={async () => {
                                    const { calculatePayroll } = await import("@/lib/hr/payrollEngine");
                                    const result = calculatePayroll({
                                        basicSalary: Number(user.basic_salary) || 0,
                                        fixedAllowances: Number(user.fixed_allowances) || 0,
                                        otHours: 0,
                                        epfEmployeeRate: user.epf_employee_rate ? Number(user.epf_employee_rate) : 0.08,
                                        epfEmployerRate: user.epf_employer_rate ? Number(user.epf_employer_rate) : 0.12,
                                        etfEmployerRate: user.etf_employer_rate ? Number(user.etf_employer_rate) : 0.03
                                    });
                                    setSelectedEmployee({
                                        name: user.full_name,
                                        role: user.designation || user.role,
                                        basic: Number(user.basic_salary) || 0,
                                        allowances: Number(user.fixed_allowances) || 0,
                                        ...result
                                    });
                                    setIsPayslipModalOpen(true);
                                }}
                            >
                                <Eye className="h-4 w-4" /> View Current Slip
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <PayslipModal
                isOpen={isPayslipModalOpen}
                onClose={() => setIsPayslipModalOpen(false)}
                employee={selectedEmployee}
            />
        </div>
    );
}
