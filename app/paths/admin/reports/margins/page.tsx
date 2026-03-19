"use client";

import { useState, useEffect } from "react";
import { getMarginReportData, MarginReportItem } from "@/server-actions/admin/reports";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function MarginReportPage() {
    const [data, setData] = useState<MarginReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const report = await getMarginReportData();
            setData(report);
            setLoading(false);
        }
        load();
    }, []);

    // Helper to csv export
    const downloadCSV = () => {
        const headers = ["Name,SKU,Category,Cost,Retail,Sale,Active,Margin,Margin%,Stock"];
        const rows = data.map(d =>
            `"${d.name}","${d.sku}","${d.category_path}",${d.cost_price},${d.retail_price},${d.sale_price},${d.active_price},${d.margin_value},${d.margin_percent.toFixed(2)},${d.stock}`
        );
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "margin_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const totalStockValue = data.reduce((acc, item) => acc + (item.cost_price * item.stock), 0);
    const totalRetailValue = data.reduce((acc, item) => acc + (item.active_price * item.stock), 0);
    const potentialProfit = totalRetailValue - totalStockValue;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Margin & Profitability Analysis</h1>
                    <p className="text-slate-500">Real-time analysis of product margins based on Cost vs Active Selling Price.</p>
                </div>
                <Button onClick={downloadCSV} variant="outline">
                    <Download className="mr-2 h-4 w-4" /> Export CSV
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Inventory Cost</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">LKR {totalStockValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Retail Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">LKR {totalRetailValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Projected Profit</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">LKR {potentialProfit.toLocaleString()}</div>
                        <div className="text-xs text-slate-500 mt-1">
                            Avg Margin: {totalRetailValue > 0 ? ((potentialProfit / totalRetailValue) * 100).toFixed(1) : 0}%
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Cost (LKR)</TableHead>
                            <TableHead className="text-right">Retail (LKR)</TableHead>
                            <TableHead className="text-right">Active (LKR)</TableHead>
                            <TableHead className="text-right">Margin</TableHead>
                            <TableHead className="text-right">Margin %</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-400">Loading analysis...</TableCell>
                            </TableRow>
                        ) : data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center py-8 text-slate-400">No data available.</TableCell>
                            </TableRow>
                        ) : (
                            data.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium text-slate-900">{item.name}</div>
                                        <div className="text-xs text-slate-500">{item.sku}</div>
                                    </TableCell>
                                    <TableCell>{item.category_path}</TableCell>
                                    <TableCell className="text-right font-mono text-slate-600">
                                        {item.cost_price.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-mono text-slate-400">
                                        {item.retail_price.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right font-bold text-slate-900">
                                        {item.active_price.toLocaleString()}
                                        {item.sale_price > 0 && item.sale_price < item.retail_price && (
                                            <Badge variant="destructive" className="ml-2 text-[10px] px-1 py-0 h-4">SALE</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                        +{item.margin_value.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant={item.margin_percent < 15 ? "secondary" : item.margin_percent > 40 ? "default" : "outline"}
                                            className={item.margin_percent > 40 ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                                        >
                                            {item.margin_percent.toFixed(1)}%
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">{item.stock}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
