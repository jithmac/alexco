"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getEmployeesAndPayroll } from "@/server-actions/admin/hr";
import { PayslipModal } from "@/components/hr/PayslipModal";
import { Download, Eye, Users, Wallet, Building2, Receipt } from "lucide-react";

export default function PayrollPage() {
    const [payroll, setPayroll] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        async function load() {
            const data = await getEmployeesAndPayroll();
            setPayroll(data);
            setLoading(false);
        }
        load();
    }, []);

    // Calculate totals
    const totals = payroll.reduce((acc, p) => ({
        grossSalary: acc.grossSalary + (p.grossSalary || 0),
        netSalary: acc.netSalary + (p.netSalary || 0),
        epfEmployee: acc.epfEmployee + (p.epfEmployee || 0),
        epfEmployer: acc.epfEmployer + (p.epfEmployer || 0),
        etfEmployer: acc.etfEmployer + (p.etfEmployer || 0),
        apitTax: acc.apitTax + (p.apitTax || 0),
    }), { grossSalary: 0, netSalary: 0, epfEmployee: 0, epfEmployer: 0, etfEmployer: 0, apitTax: 0 });

    const totalPayrollCost = totals.grossSalary + totals.epfEmployer + totals.etfEmployer;

    const handleViewPayslip = (employee: any) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    const formatCurrency = (amount: number) =>
        amount.toLocaleString('en-LK', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Payroll Processing (Jan 2026)</h1>
                <Button className="gap-2" variant="outline">
                    <Download className="h-4 w-4" /> Export Bank File
                </Button>
            </div>

            {/* Summary Cards */}
            {!loading && payroll.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-blue-600 font-medium uppercase">Employees</div>
                                    <div className="text-2xl font-bold text-blue-900">{payroll.length}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Wallet className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-green-600 font-medium uppercase">Net Payable</div>
                                    <div className="text-2xl font-bold text-green-900">Rs. {formatCurrency(totals.netSalary)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Building2 className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-purple-600 font-medium uppercase">EPF + ETF</div>
                                    <div className="text-2xl font-bold text-purple-900">
                                        Rs. {formatCurrency(totals.epfEmployee + totals.epfEmployer + totals.etfEmployer)}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Receipt className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                    <div className="text-xs text-orange-600 font-medium uppercase">Total Cost</div>
                                    <div className="text-2xl font-bold text-orange-900">Rs. {formatCurrency(totalPayrollCost)}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Calculated Salaries</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center py-8 text-slate-400">
                            <div className="animate-pulse">Loading payroll engine...</div>
                        </div>
                    ) : payroll.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            No employees found or no permission to view.
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3">Employee</th>
                                        <th className="px-4 py-3 text-right">Basic</th>
                                        <th className="px-4 py-3 text-right">Allowances</th>
                                        <th className="px-4 py-3 text-right">Gross</th>
                                        <th className="px-4 py-3 text-right text-red-500">EPF (8%)</th>
                                        <th className="px-4 py-3 text-right text-red-500">APIT</th>
                                        <th className="px-4 py-3 text-right text-blue-500">EPF (12%)</th>
                                        <th className="px-4 py-3 text-right text-blue-500">ETF (3%)</th>
                                        <th className="px-4 py-3 text-right font-semibold">Net Salary</th>
                                        <th className="px-4 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payroll.map((p) => (
                                        <tr key={p.id} className="border-b hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-slate-900">{p.name}</div>
                                                <div className="text-xs text-slate-400">{p.role || 'Employee'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {formatCurrency(p.basic || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-600">
                                                {formatCurrency(p.allowances || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatCurrency(p.grossSalary || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-500">
                                                -{formatCurrency(p.epfEmployee || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-red-500">
                                                -{formatCurrency(p.apitTax || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-blue-500">
                                                {formatCurrency(p.epfEmployer || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-blue-500">
                                                {formatCurrency(p.etfEmployer || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-green-700">
                                                {formatCurrency(p.netSalary || 0)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewPayslip(p)}
                                                    className="gap-1 text-slate-500 hover:text-slate-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-slate-100 font-semibold">
                                    <tr>
                                        <td className="px-4 py-3">TOTALS</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">-</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(totals.grossSalary)}</td>
                                        <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(totals.epfEmployee)}</td>
                                        <td className="px-4 py-3 text-right text-red-600">-{formatCurrency(totals.apitTax)}</td>
                                        <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(totals.epfEmployer)}</td>
                                        <td className="px-4 py-3 text-right text-blue-600">{formatCurrency(totals.etfEmployer)}</td>
                                        <td className="px-4 py-3 text-right text-green-700">{formatCurrency(totals.netSalary)}</td>
                                        <td className="px-4 py-3"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PayslipModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                employee={selectedEmployee}
            />
        </div>
    );
}
