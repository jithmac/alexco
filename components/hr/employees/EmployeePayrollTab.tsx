"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculatePayroll } from "@/lib/hr/payrollEngine";
import { Wallet, TrendingUp, Receipt, ShieldCheck, Eye } from "lucide-react";

interface EmployeePayrollTabProps {
    employee: any;
    onViewPayslip?: () => void;
}

export function EmployeePayrollTab({ employee, onViewPayslip }: EmployeePayrollTabProps) {
    if (!employee) return null;

    // Calculate current payroll based on employee's basic salary and settings
    const payroll = calculatePayroll({
        basicSalary: Number(employee.basic_salary) || 0,
        fixedAllowances: Number(employee.fixed_allowances) || 0,
        otHours: 0, // Placeholder - could be fetched from attendance
        epfEmployeeRate: employee.epf_employee_rate ? Number(employee.epf_employee_rate) : 0.08,
        epfEmployerRate: employee.epf_employer_rate ? Number(employee.epf_employer_rate) : 0.12,
        etfEmployerRate: employee.etf_employer_rate ? Number(employee.etf_employer_rate) : 0.03
    });

    const formatCurrency = (amount: number) =>
        amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" /> Gross Earnings
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-900">Rs. {formatCurrency(payroll.grossSalary)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                            <Receipt className="h-4 w-4" /> Total Deductions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-900">Rs. {formatCurrency(payroll.epfEmployee + payroll.apitTax)}</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
                            <Wallet className="h-4 w-4" /> Net Salary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <div className="text-2xl font-bold text-blue-900">Rs. {formatCurrency(payroll.netSalary)}</div>
                            {onViewPayslip && (
                                <button
                                    onClick={onViewPayslip}
                                    className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium bg-blue-100/50 px-2 py-1 rounded transition-colors"
                                >
                                    <Eye className="h-3 w-3" /> View Full Payslip
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-slate-500" /> Statutory Contributions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500">Employee EPF ({((employee.epf_employee_rate || 0.08) * 100).toFixed(1)}%)</span>
                            <span className="font-medium text-red-600">- Rs. {formatCurrency(payroll.epfEmployee)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500">Employer EPF ({((employee.epf_employer_rate || 0.12) * 100).toFixed(1)}%)</span>
                            <span className="font-medium text-blue-600">Rs. {formatCurrency(payroll.epfEmployer)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500">Employer ETF ({((employee.etf_employer_rate || 0.03) * 100).toFixed(1)}%)</span>
                            <span className="font-medium text-blue-600">Rs. {formatCurrency(payroll.etfEmployer)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 font-semibold">
                            <span>Total Statutory Cost</span>
                            <span>Rs. {formatCurrency(payroll.epfEmployer + payroll.etfEmployer)}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Receipt className="h-5 w-5 text-slate-500" /> Salary Components
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500">Basic Salary</span>
                            <span className="font-medium">Rs. {formatCurrency(payroll.totalEarnings - (Number(employee.fixed_allowances) || 0))}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b">
                            <span className="text-slate-500">Fixed Allowances</span>
                            <span className="font-medium">Rs. {formatCurrency(Number(employee.fixed_allowances) || 0)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b text-red-600">
                            <span>Income Tax (APIT)</span>
                            <span className="font-medium">- Rs. {formatCurrency(payroll.apitTax)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 font-bold text-lg text-blue-700">
                            <span>Final Net Payable</span>
                            <span>Rs. {formatCurrency(payroll.netSalary)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
