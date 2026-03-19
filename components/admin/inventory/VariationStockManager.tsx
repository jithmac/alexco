
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { adjustStock, getVariantStock } from "@/server-actions/admin/inventory";
import { Check, Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VariationStockManagerProps {
    product: any;
    variationsRaw: string;
    prices?: Record<string, string>;
    salePrices?: Record<string, string>;
    onPriceChange?: (combo: string, price: string) => void;
    onSalePriceChange?: (combo: string, price: string) => void;
    basePrice?: string;
}

export default function VariationStockManager({
    product,
    variationsRaw,
    prices = {},
    salePrices = {},
    onPriceChange,
    onSalePriceChange,
    basePrice = "0"
}: VariationStockManagerProps) {
    const { toast } = useToast();
    const [variants, setVariants] = useState<string[]>([]);
    const [stockLevels, setStockLevels] = useState<Record<string, number>>({});
    const [deltas, setDeltas] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState<string | null>(null);

    // 1. Parse variations and generate combinations
    useEffect(() => {
        if (!product) return;

        try {
            // Parse raw string "Color=Red,Blue; Size=S,M"
            const vars: Record<string, string[]> = {};
            if (variationsRaw) {
                variationsRaw.split(';').forEach(part => {
                    const [key, valStr] = part.split('=').map(s => s.trim());
                    if (key && valStr) {
                        // Deduplicate values using Set
                        vars[key] = Array.from(new Set(valStr.split(',').map(s => s.trim()).filter(Boolean)));
                    }
                });
            }

            // entries: [ ["Color", ["Red", "Blue"]], ["Size", ["S", "M"]] ]
            const entries = Object.entries(vars).sort((a, b) => a[0].localeCompare(b[0]));
            if (entries.length === 0) {
                setVariants([]);
                return;
            }

            // Generate cartesian product
            // e.g. results = [ "Color:Red;Size:S", "Color:Red;Size:M", ... ]
            // Normalized key format: "Key:Value;Key:Value"
            const generate = (index: number, current: string[]) => {
                if (index === entries.length) {
                    return [current.join('; ')];
                }
                const [key, values] = entries[index];
                const vals = Array.isArray(values) ? values : [values];
                const res: string[] = [];
                for (const val of vals) {
                    res.push(...generate(index + 1, [...current, `${key}:${val}`]));
                }
                return res;
            };

            const combos = generate(0, []);
            setVariants(combos);
            // Don't reload stock every time typing changes, only on mount or if product changes
            // But if variants change, we might want to fetch stock for them? 
            // Actually getVariantStock returns ALL stock for the product ID.
            // So we don't need to re-fetch stock when `variationsRaw` changes, 
            // we just need to re-render the table with the new variant keys.
            // Existing stock levels from `stockLevels` state will map to the new keys if they match.

        } catch (e) {
            console.error("Failed to parse variations for stock manager", e);
        }
    }, [product, variationsRaw]);

    useEffect(() => {
        if (product) {
            loadStock();
        }
    }, [product]);

    async function loadStock() {
        setLoading(true);
        const stocks = await getVariantStock(product.id);
        setStockLevels(stocks);
        setLoading(false);
    }

    const handleDeltaChange = (variant: string, val: string) => {
        setDeltas(prev => ({ ...prev, [variant]: val }));
    };

    const handleUpdate = async (variant: string) => {
        const delta = parseInt(deltas[variant]);

        if (isNaN(delta) || delta === 0) {
            toast({ title: "Invalid Amount", description: "Please enter a quantity greater than 0", variant: "destructive" });
            return;
        }

        setSaving(variant);
        const res = await adjustStock(product.id, delta, "VAR_ADJ", variant);

        if (res.success) {
            toast({ title: "Stock updated", description: `Added ${delta} to ${variant}` });
            setDeltas(prev => ({ ...prev, [variant]: "" }));
            // Refresh stock for this variant locally or reload all?
            // Reload all is safer to ensure consistency
            await loadStock();
        } else {
            toast({ title: "Update failed", description: res.error, variant: "destructive" });
        }
        setSaving(null);
    };

    const resolveValue = (obj: Record<string, any>, rawCombo: string) => {
        if (!obj) return undefined;
        if (obj[rawCombo] !== undefined) return obj[rawCombo];
        const normalizedCombo = rawCombo.replace(/\s/g, '');
        const matchedKey = Object.keys(obj).find(k => k.replace(/\s/g, '') === normalizedCombo);
        return matchedKey ? obj[matchedKey] : undefined;
    };

    if (!variants.length) return null;

    return (
        <div className="space-y-3 mt-4 border rounded-md p-4 bg-slate-50">
            <div className="flex justify-between items-center">
                <h4 className="font-semibold text-sm text-slate-900">Variation Stock</h4>
                <Button type="button" variant="ghost" size="sm" onClick={loadStock} disabled={loading}>
                    <RotateCcw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Variation</TableHead>
                            <TableHead className="text-right w-[160px]">Current Price</TableHead>
                            <TableHead className="text-right w-[160px]">Sale Price</TableHead>
                            <TableHead className="text-right w-[100px]">Stock</TableHead>
                            <TableHead className="text-right w-[130px]">Adjust (+/-)</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.map((v) => (
                            <TableRow key={v}>
                                <TableCell className="font-medium text-xs">{v}</TableCell>
                                <TableCell className="text-right">
                                    <Input
                                        type="number"
                                        placeholder={basePrice}
                                        className="h-8 text-right font-mono"
                                        value={resolveValue(prices, v) || ""}
                                        onChange={(e) => onPriceChange?.(v, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <Input
                                        type="number"
                                        placeholder="Sale Price"
                                        className="h-8 text-right font-mono"
                                        value={resolveValue(salePrices, v) || ""}
                                        onChange={(e) => onSalePriceChange?.(v, e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                    {resolveValue(stockLevels, v) || 0}
                                </TableCell>
                                <TableCell>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        className="h-8 text-right"
                                        value={deltas[v] || ""}
                                        onChange={(e) => handleDeltaChange(v, e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleUpdate(v);
                                            }
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="outline"
                                        className="h-8 w-8 border-slate-300 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                                        onClick={() => {
                                            handleUpdate(v);
                                        }}
                                        disabled={saving === v}
                                    >
                                        {saving === v ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Check className="h-4 w-4" />
                                        )}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <p className="text-[10px] text-slate-400 text-center">
                Enter positive values to add stock, negative to remove.
            </p>
        </div>
    );
}
