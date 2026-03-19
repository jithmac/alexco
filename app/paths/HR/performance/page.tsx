"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateCommissions } from "@/server-actions/hr/performance";
import { DollarSign, Award, TrendingUp } from "lucide-react";

export default function PerformancePage() {
    const [calculating, setCalculating] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    async function handleCalculate() {
        setCalculating(true);
        const date = new Date();
        const data = await calculateCommissions(date.getMonth() + 1, date.getFullYear());
        setResults(data);
        setCalculating(false);
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Performance & Commissions</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Commissions</CardTitle>
                        <DollarSign className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">LKR 45,200</div>
                        <p className="text-xs text-slate-500">+12% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Top Performer</CardTitle>
                        <Award className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Kasun Perera</div>
                        <p className="text-xs text-slate-500">Retail • LKR 1.2M Sales</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Commission Calculation (Current Month)</span>
                        <Button onClick={handleCalculate} disabled={calculating}>
                            {calculating ? 'Calculating...' : 'Run Calculator'}
                        </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {results.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="px-4 py-2 text-left">Employee ID</th>
                                    <th className="px-4 py-2 text-right">Total Sales</th>
                                    <th className="px-4 py-2 text-left">Tier</th>
                                    <th className="px-4 py-2 text-right">Commission</th>
                                </tr>
                            </thead>
                            <tbody>
                                {results.map((r, i) => (
                                    <tr key={i} className="border-b">
                                        <td className="px-4 py-2">{r.employee_id}</td>
                                        <td className="px-4 py-2 text-right">{r.total_sales.toLocaleString()}</td>
                                        <td className="px-4 py-2">{r.tier_name}</td>
                                        <td className="px-4 py-2 text-right font-bold text-green-600">
                                            {r.commission_amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center text-slate-400 py-8">
                            Click 'Run Calculator' to view estimated commissions.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
