"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { adjustStock } from "@/server-actions/admin/inventory";

interface StockAdjustmentDialogProps {
    product: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export default function StockAdjustmentDialog({ product, open, onOpenChange, onSuccess }: StockAdjustmentDialogProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const type = formData.get('type') as string;
        const qty = Number(formData.get('quantity'));
        const reason = formData.get('reason') as string;

        // Calculate delta (Add = positive, Remove = negative)
        const delta = type === 'add' ? qty : -qty;

        const result = await adjustStock(product.id, delta, reason);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setLoading(false);
            onSuccess();
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock: {product.name}</DialogTitle>
                    <DialogDescription>Current Stock: {product.current_stock}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Action *</label>
                            <Select name="type" defaultValue="add" required>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="add">Add Stock (+)</SelectItem>
                                    <SelectItem value="remove">Remove Stock (-)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <label className="text-sm font-medium">Quantity *</label>
                            <Input name="quantity" type="number" min="1" required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Reason Code *</label>
                        <Select name="reason" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RESTOCK">Restock Shipment</SelectItem>
                                <SelectItem value="RETURN">Customer Return</SelectItem>
                                <SelectItem value="DAMAGE">Damaged / Expired</SelectItem>
                                <SelectItem value="CORRECTION">Count Correction</SelectItem>
                                <SelectItem value="INTERNAL">Internal Use</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Update Stock'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
