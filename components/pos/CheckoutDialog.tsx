"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CreditCard, Banknote, Landmark } from "lucide-react";

interface CheckoutDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    onComplete: (method: string, tenderAmount?: number) => Promise<void>;
}

export default function CheckoutDialog({ open, onOpenChange, total, onComplete }: CheckoutDialogProps) {
    const [method, setMethod] = useState("CASH");
    const [tendered, setTendered] = useState("");
    const [loading, setLoading] = useState(false);

    const numericTendered = parseFloat(tendered) || 0;
    const change = numericTendered - total;
    const canComplete = method === 'CASH' ? numericTendered >= total : true;

    // Reset when opened
    useEffect(() => {
        if (open) {
            setMethod("CASH");
            setTendered("");
            setLoading(false);
        }
    }, [open]);

    const handleComplete = async () => {
        setLoading(true);
        await onComplete(method, numericTendered);
        setLoading(false); // Parent will likely close dialog, but just in case
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Sale</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <div className="text-center mb-6">
                        <div className="text-sm text-slate-500">Total Amount</div>
                        <div className="text-4xl font-bold text-slate-900">LKR {total.toLocaleString()}</div>
                    </div>

                    <Tabs value={method} onValueChange={setMethod} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="CASH"><Banknote className="h-4 w-4 mr-2" /> Cash</TabsTrigger>
                            <TabsTrigger value="CARD"><CreditCard className="h-4 w-4 mr-2" /> Card</TabsTrigger>
                            <TabsTrigger value="ONLINE"><Landmark className="h-4 w-4 mr-2" /> Online</TabsTrigger>
                        </TabsList>

                        <div className="mt-4 p-4 bg-slate-50 rounded-lg border">
                            {method === 'CASH' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1 block">Amount Tendered</label>
                                        <Input
                                            autoFocus
                                            type="number"
                                            className="text-lg"
                                            value={tendered}
                                            onChange={(e) => setTendered(e.target.value)}
                                            placeholder="Enter amount..."
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t">
                                        <span className="font-semibold text-slate-700">Change Due:</span>
                                        <span className={`text-xl font-bold ${change < 0 ? 'text-red-500' : 'text-green-600'}`}>
                                            LKR {Math.max(0, change).toLocaleString()}
                                        </span>
                                    </div>
                                    {change < 0 && (
                                        <p className="text-xs text-red-500 text-right">Insufficient amount</p>
                                    )}
                                </div>
                            )}

                            {method === 'CARD' && (
                                <div className="text-center py-6 text-slate-600">
                                    <CreditCard className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Please swipe card on the terminal.</p>
                                </div>
                            )}

                            {method === 'ONLINE' && (
                                <div className="text-center py-6 text-slate-600">
                                    <Landmark className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Verify bank transfer receipt.</p>
                                </div>
                            )}
                        </div>
                    </Tabs>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button
                        onClick={handleComplete}
                        disabled={!canComplete || loading}
                        className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                        {loading ? "Processing..." : "Confirm Payment"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
