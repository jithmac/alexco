"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PayslipModalProps {
    isOpen: boolean;
    onClose: () => void;
    employee: {
        name: string;
        role?: string;
        basic: number;
        allowances: number;
        otPay: number;
        grossSalary: number;
        epfEmployee: number;
        epfEmployer: number;
        etfEmployer: number;
        apitTax: number;
        netSalary: number;
    } | null;
    period?: string;
}

export function PayslipModal({ isOpen, onClose, employee, period = "January 2026" }: PayslipModalProps) {
    if (!employee) return null;

    const totalDeductions = employee.epfEmployee + employee.apitTax;
    const totalEmployerContributions = employee.epfEmployer + employee.etfEmployer;

    const formatCurrency = (amount: number) =>
        amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Payslip - {period}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 font-mono text-sm">
                    {/* Employee Info */}
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="font-semibold text-slate-900">{employee.name}</div>
                        <div className="text-slate-500 text-xs">{employee.role || 'Employee'}</div>
                    </div>

                    {/* Earnings */}
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Earnings</div>
                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <span className="text-slate-600">Basic Salary</span>
                                <span className="text-slate-900">{formatCurrency(employee.basic)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600">Fixed Allowances</span>
                                <span className="text-slate-900">{formatCurrency(employee.allowances)}</span>
                            </div>
                            {employee.otPay > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Overtime Pay</span>
                                    <span className="text-slate-900">{formatCurrency(employee.otPay)}</span>
                                </div>
                            )}
                            <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-semibold">
                                <span className="text-slate-700">Gross Salary</span>
                                <span className="text-slate-900">{formatCurrency(employee.grossSalary)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div>
                        <div className="text-xs font-semibold text-slate-500 uppercase mb-2">Deductions</div>
                        <div className="space-y-1">
                            <div className="flex justify-between text-red-600">
                                <span>EPF (8%)</span>
                                <span>-{formatCurrency(employee.epfEmployee)}</span>
                            </div>
                            <div className="flex justify-between text-red-600">
                                <span>APIT Tax</span>
                                <span>-{formatCurrency(employee.apitTax)}</span>
                            </div>
                            <div className="border-t border-slate-200 pt-1 mt-1 flex justify-between font-semibold text-red-700">
                                <span>Total Deductions</span>
                                <span>-{formatCurrency(totalDeductions)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Net Salary */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-green-800">NET SALARY</span>
                            <span className="text-xl font-bold text-green-700">
                                Rs. {formatCurrency(employee.netSalary)}
                            </span>
                        </div>
                    </div>

                    {/* Employer Contributions */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <div className="text-xs font-semibold text-blue-600 uppercase mb-2">
                            Employer Contributions (Not deducted)
                        </div>
                        <div className="space-y-1 text-blue-700">
                            <div className="flex justify-between">
                                <span>EPF (12%)</span>
                                <span>{formatCurrency(employee.epfEmployer)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>ETF (3%)</span>
                                <span>{formatCurrency(employee.etfEmployer)}</span>
                            </div>
                            <div className="border-t border-blue-200 pt-1 mt-1 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(totalEmployerContributions)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
