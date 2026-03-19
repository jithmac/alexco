"use client";

import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInventoryConflicts, resolveConflict, InventoryConflict } from "@/server-actions/admin/inventory";

export default function InventoryAlerts() {
    const [conflicts, setConflicts] = useState<InventoryConflict[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConflicts = async () => {
        setLoading(true);
        const data = await getInventoryConflicts();
        setConflicts(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchConflicts();
    }, []);

    const handleResolve = async (productId: string, currentStock: number) => {
        // Simple resolution: Add enough stock to reach 0
        const missing = Math.abs(currentStock);
        const result = await resolveConflict(productId, 'ADJUST', missing);
        if (result.success) {
            await fetchConflicts(); // Reload
        }
    };

    return (
        <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    Stock Conflicts (Negative Inventory)
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={fetchConflicts} disabled={loading}>
                    <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </CardHeader>

            <CardContent>
                {loading ? (
                    <div className="py-4 text-center text-slate-400">Scanning ledger...</div>
                ) : conflicts.length === 0 ? (
                    <div className="py-8 text-center text-green-600 flex flex-col items-center">
                        <CheckCircle className="h-8 w-8 mb-2" />
                        <p className="font-medium">All inventory is balanced.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {conflicts.map(c => (
                            <div key={c.productId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-red-50 rounded-lg border border-red-100">
                                <div>
                                    <h4 className="font-bold text-slate-800">{c.productName}</h4>
                                    <div className="text-sm text-slate-600 flex gap-4 mt-1">
                                        <span>SKU: {c.sku}</span>
                                        <span className="font-bold text-red-600">Stock: {c.stockLevel}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2">
                                        Oversold by {Math.abs(c.stockLevel)} units. Sync latency detected.
                                    </p>
                                </div>
                                <div className="mt-4 sm:mt-0 flex gap-2">
                                    <Button size="sm" variant="destructive" onClick={() => handleResolve(c.productId, c.stockLevel)}>
                                        Refund / Adjust
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => handleResolve(c.productId, c.stockLevel)}>
                                        Emergency Restock
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
