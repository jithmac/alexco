"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateCFormText, generateBankTransferFile, getPayrollSummary } from "@/server-actions/hr/reports";
import { Download, FileText, CreditCard, PieChart } from "lucide-react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const YEARS = [2024, 2025, 2026, 2027];

export default function ReportsPage() {
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    async function loadSummary() {
        setLoading(true);
        const data = await getPayrollSummary(month, year);
        setSummary(data);
        setLoading(false);
    }

    async function downloadFile(filename: string, content: string, type: string = 'text/plain') {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async function handleDownloadCForm() {
        const content = await generateCFormText(month, year);
        downloadFile(`C-Form-${MONTHS[month - 1]}-${year}.csv`, content);
    }

    async function handleDownloadBank(bank: 'BOC' | 'SAMPATH' | 'COMMERCIAL') {
        const content = await generateBankTransferFile(month, year, bank);
        downloadFile(`Salary-${bank}-${MONTHS[month - 1]}-${year}.txt`, content);
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900">Payroll Reports</h1>
            </div>

            {/* Controls */}
            <Card>
                <CardContent className="p-6 flex gap-4 items-end">
                    <div className="w-48">
                        <label className="block text-sm font-medium mb-1">Month</label>
                        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((m, i) => (
                                    <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-32">
                        <label className="block text-sm font-medium mb-1">Year</label>
                        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {YEARS.map((y) => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button onClick={loadSummary} disabled={loading}>
                        {loading ? 'Loading...' : 'Generate Summary'}
                    </Button>
                </CardContent>
            </Card>

            {/* Summary Stats */}
            {summary && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatCard label="Total Net Salary" value={summary.total_net} icon={CreditCard} color="text-green-600 bg-green-100" />
                        <StatCard label="Total EPF (20%)" value={Number(summary.total_epf_emp || 0) + Number(summary.total_epf_employer || 0)} icon={PieChart} color="text-blue-600 bg-blue-100" />
                        <StatCard label="Total ETF (3%)" value={summary.total_etf} icon={PieChart} color="text-purple-600 bg-purple-100" />
                        <StatCard label="Total TAX (APIT)" value={summary.total_tax} icon={FileText} color="text-red-600 bg-red-100" />
                    </div>

                    {/* Download Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Download Reports & Exports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Statutory Reports */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-700">Statutory Reports</h3>
                                    <Button variant="outline" className="w-full justify-start gap-2" onClick={handleDownloadCForm}>
                                        <FileText className="h-4 w-4" />
                                        Download C-Form (EPF Return)
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" disabled>
                                        <FileText className="h-4 w-4" />
                                        Download R-Form (Registration)
                                    </Button>
                                </div>

                                {/* Bank Exports */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-slate-700">Bank Transfer Files</h3>
                                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleDownloadBank('BOC')}>
                                        <Download className="h-4 w-4" />
                                        Bank of Ceylon (SLIPS)
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleDownloadBank('COMMERCIAL')}>
                                        <Download className="h-4 w-4" />
                                        Commercial Bank (Review File)
                                    </Button>
                                    <Button variant="outline" className="w-full justify-start gap-2" onClick={() => handleDownloadBank('SAMPATH')}>
                                        <Download className="h-4 w-4" />
                                        Sampath Vishwa File
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: any) {
    return (
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-3 rounded-full ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <div className="text-2xl font-bold">
                        {Number(value || 0).toLocaleString('en-LK', { style: 'currency', currency: 'LKR' })}
                    </div>
                    <div className="text-sm text-slate-500">{label}</div>
                </div>
            </CardContent>
        </Card>
    );
}
