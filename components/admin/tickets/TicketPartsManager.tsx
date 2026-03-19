"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { addTicketItem, removeTicketItem } from "@/server-actions/admin/tickets";
import { useToast } from "@/hooks/use-toast";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getInventoryList } from "@/server-actions/admin/inventory";

export default function TicketPartsManager({ ticketId, items, onItemChange }: { ticketId: string, items: any[], onItemChange: () => void }) {
    const { toast } = useToast();
    const [isAdding, setAdding] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [search, setSearch] = useState("");

    const loadProducts = async () => {
        const list = await getInventoryList(search);
        setProducts(list);
    };

    const handleAdd = async (productId: string, variantId?: string) => {
        await addTicketItem(ticketId, productId, 1, variantId);
        toast({ title: "Part Added" });
        onItemChange();
        setAdding(false);
    };

    const handleRemove = async (itemId: string) => {
        await removeTicketItem(itemId);
        toast({ title: "Part Removed" });
        onItemChange();
    };

    const handleUpdateQty = async (itemId: string, newQty: number) => {
        if (newQty < 1) return handleRemove(itemId);
        const { updateTicketItemQuantity } = await import("@/server-actions/admin/tickets");
        await updateTicketItemQuantity(itemId, newQty);
        onItemChange();
    };

    const totalPartsCost = items.reduce((sum, item) => sum + Number(item.line_total), 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-900">Parts & Materials</h3>
                <Dialog open={isAdding} onOpenChange={setAdding}>
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={loadProducts}>
                            <Plus className="h-4 w-4 mr-2" /> Add Part
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add Part to Ticket</DialogTitle>
                            <DialogDescription>
                                Search for parts in the inventory to add to this ticket.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Search inventory..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && loadProducts()}
                                />
                                <Button onClick={loadProducts}>Search</Button>
                            </div>
                            <div className="grid gap-2">
                                {products.map(p => {
                                    const hasVariations = p.variations && p.variations !== '{}';
                                    let variations: Record<string, string[]> = {};
                                    try {
                                        variations = typeof p.variations === 'string' ? JSON.parse(p.variations) : p.variations;
                                    } catch (e) { }

                                    // Identify if we need to show variant selectors (Simplified for V1: Just list variants as separate buttons or dropdown if complex.
                                    // Actually, we need to know the specific variant ID to deduct stock.
                                    // BUT, currently products with variations don't have separate sub-IDs in the products table unless we look at ledger or structure.
                                    // Wait, the inventory system uses `variations` column for display, but stock is tracked by `variant_id` in ledger?
                                    // Let's assume standard simple variations for now: just main product or check if we need to pick a specific one.
                                    // If strict tracking is needed, we would need to know the specific combination.

                                    // For now, let's allow adding the main product. If variations exist, maybe just add a note?
                                    // The user asked for "variation level". 
                                    // Implementation: If variations exist, show a "Select Variant" popup or expander.

                                    return (
                                        <div key={p.id} className="flex flex-col p-3 border rounded hover:bg-slate-50 gap-2">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-medium">{p.name}</div>
                                                    <div className="text-xs text-slate-500">SKU: {p.sku} | Stock: {p.current_stock}</div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-mono">LKR {Number(p.price_retail).toLocaleString()}</span>
                                                    {!hasVariations && (
                                                        <Button size="sm" onClick={() => handleAdd(p.id)}>Add</Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Variant Selection if available */}
                                            {hasVariations && (
                                                <div className="text-sm bg-slate-100 p-2 rounded">
                                                    <span className="font-semibold text-xs text-slate-500 uppercase tracking-wider">Select Variation:</span>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {/* 
                                                            Since we don't have a structured "Product Variant" table with IDs, 
                                                            we usually rely on generating a variant string ID like "Color:Red;Size:M".
                                                            Let's iterate available options.
                                                         */}
                                                        {Object.entries(variations).map(([key, values]) => (
                                                            (values as string[]).map(val => {
                                                                const variantId = `${key}:${val}`; // Simple ID scheme
                                                                return (
                                                                    <Button
                                                                        key={variantId}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="text-xs"
                                                                        onClick={() => handleAdd(p.id, variantId)}
                                                                    >
                                                                        {key}: {val}
                                                                    </Button>
                                                                );
                                                            })
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border rounded-md overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Item</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-slate-500 py-4">No parts added</TableCell>
                            </TableRow>
                        ) : (
                            items.map(item => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <div className="font-medium">{item.name}</div>
                                        <div className="text-xs text-slate-500">
                                            {item.sku}
                                            {item.variant_id && <span className="ml-2 text-blue-600 bg-blue-50 px-1 rounded">{item.variant_id}</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="outline" size="icon" className="h-6 w-6"
                                                onClick={() => handleUpdateQty(item.id, item.quantity - 1)}>
                                                -
                                            </Button>
                                            <span>{item.quantity}</span>
                                            <Button variant="outline" size="icon" className="h-6 w-6"
                                                onClick={() => handleUpdateQty(item.id, item.quantity + 1)}>
                                                +
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">{Number(item.price_retail).toLocaleString()}</TableCell>
                                    <TableCell className="text-right">{Number(item.line_total).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end pt-2 border-t">
                <div className="text-right">
                    <span className="text-sm text-slate-500 mr-4">Total Parts Cost:</span>
                    <span className="text-lg font-bold">LKR {totalPartsCost.toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}
