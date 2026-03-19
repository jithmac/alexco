"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Product {
    id: string;
    sku: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    variations?: Record<string, string[]>;
    variation_prices?: Record<string, number>;
    variation_sale_prices?: Record<string, number>;
    variant_stocks?: Record<string, number>;
}

interface VariationQuantityDialogProps {
    product: Product | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (product: Product, quantity: number, selectedVariations: Record<string, string>, resolvedPrice: number) => void;
}

/** Helper to find a matching completely-selected combo ignoring order */
function findMatchingCombo(pricesMap: Record<string, number> | undefined, selectedPairs: string[]): number | undefined {
    if (!pricesMap || Object.keys(pricesMap).length === 0) return undefined;
    for (const [combo, price] of Object.entries(pricesMap)) {
        const comboPairs = combo.split(';').map(s => s.trim());
        if (comboPairs.length === selectedPairs.length && selectedPairs.every(sp => comboPairs.includes(sp))) {
            return price;
        }
    }
    return undefined;
}

/** Resolve the effective stock given the currently selected variations */
function resolveStock(
    baseStock: number,
    selectedVariations: Record<string, string>,
    variantStocks?: Record<string, number>,
    allVariations?: Record<string, string[]>
): number {
    if (!variantStocks || Object.keys(variantStocks).length === 0) return baseStock;

    if (allVariations) {
        const selectedPairs = Object.entries(selectedVariations).map(([k, v]) => `${k}:${v}`);
        if (selectedPairs.length === Object.keys(allVariations).length) {
            // Find combo
            for (const [combo, stock] of Object.entries(variantStocks)) {
                const comboPairs = combo.split(';').map(s => s.trim());
                if (comboPairs.length === selectedPairs.length && selectedPairs.every(sp => comboPairs.includes(sp))) {
                    return stock;
                }
            }
        }
    }
    return baseStock;
}

/** Given selected variations and variation_prices map, compute the effective price.
 *  Strategy: use the last selected variation's price (the most specific match). Falls back to base price. */
function resolvePrice(
    basePrice: number,
    selectedVariations: Record<string, string>,
    variationPrices?: Record<string, number>,
    variationSalePrices?: Record<string, number>,
    allVariations?: Record<string, string[]>
): { currentPrice: number, originalPrice: number | null } {
    let original = basePrice;
    let effective = basePrice;
    let hasVariantPrice = false;

    if (!variationPrices || Object.keys(variationPrices).length === 0) {
        return { currentPrice: effective, originalPrice: null };
    }

    const selectedPairs = Object.entries(selectedVariations).map(([k, v]) => `${k}:${v}`);
    const isCompletelySelected = allVariations && selectedPairs.length === Object.keys(allVariations).length;

    if (isCompletelySelected) {
        const matchingPrice = findMatchingCombo(variationPrices, selectedPairs);
        if (matchingPrice !== undefined && matchingPrice > 0) {
            original = matchingPrice;
            effective = original;
            hasVariantPrice = true;
        }

        const matchingSalePrice = findMatchingCombo(variationSalePrices, selectedPairs);
        if (matchingSalePrice !== undefined && matchingSalePrice > 0) {
            effective = matchingSalePrice;
        }
    }

    if (!hasVariantPrice) {
        for (const [type, value] of Object.entries(selectedVariations)) {
            const pair = `${type}:${value}`;
            if (variationPrices[pair] !== undefined && variationPrices[pair] > 0) {
                original = variationPrices[pair];
                effective = original;
            }
            if (variationSalePrices && variationSalePrices[pair] !== undefined && variationSalePrices[pair] > 0) {
                effective = variationSalePrices[pair];
            }
        }
    }

    return {
        currentPrice: effective,
        originalPrice: effective !== original ? original : null
    };
}

export default function VariationQuantityDialog({
    product,
    open,
    onOpenChange,
    onConfirm,
}: VariationQuantityDialogProps) {
    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
    const [quantity, setQuantity] = useState(1);
    const [missingSelection, setMissingSelection] = useState<string | null>(null);

    // Reset state when product changes or dialog opens
    useEffect(() => {
        if (open && product) {
            setSelectedVariations({});
            setQuantity(1);
            setMissingSelection(null);
        }
    }, [open, product]);

    if (!product) return null;

    const hasVariations = product.variations && Object.keys(product.variations).length > 0;

    const handleSelect = (key: string, value: string) => {
        setSelectedVariations((prev) => ({ ...prev, [key]: value }));
        if (missingSelection === key) setMissingSelection(null);
    };

    const handleConfirm = () => {
        if (hasVariations) {
            for (const key of Object.keys(product.variations!)) {
                if (!selectedVariations[key]) {
                    setMissingSelection(key);
                    return;
                }
            }
        }
        const resolvedPrice = resolvePrice(product.price, selectedVariations, product.variation_prices, product.variation_sale_prices, product.variations).currentPrice;
        onConfirm(product, quantity, selectedVariations, resolvedPrice);
        onOpenChange(false);
    };

    const { currentPrice, originalPrice } = resolvePrice(product.price, selectedVariations, product.variation_prices, product.variation_sale_prices, product.variations);
    const priceChanged = originalPrice !== null || currentPrice !== product.price;

    const currentStock = resolveStock(
        product.stock,
        selectedVariations,
        product.variant_stocks,
        product.variations
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex justify-between items-center pr-6">
                        <span>Configure Product</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    {/* Product Info */}
                    <div className="flex gap-4 items-start bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="h-12 w-12 bg-white rounded-lg flex items-center justify-center text-xl font-bold text-slate-300 border shadow-sm">
                            {product.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 leading-tight">{product.name}</h3>
                            <p className="text-xs text-slate-500 font-mono mt-1">{product.sku}</p>
                            <div className="flex justify-between items-end mt-2">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-blue-600 font-bold">
                                        LKR {currentPrice.toLocaleString()}
                                    </span>
                                    {priceChanged && (
                                        <span className="text-[10px] text-slate-400 line-through">
                                            LKR {(originalPrice || product.price).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded font-medium",
                                    currentStock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                )}>
                                    {currentStock > 0 ? `${currentStock} in stock` : "Out of stock"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Variations */}
                    {hasVariations && (
                        <div className="space-y-4 max-h-[300px] overflow-y-auto px-1">
                            {Object.entries(product.variations!).map(([key, options]) => (
                                <div key={key} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-semibold text-slate-700">{key}</h4>
                                        {missingSelection === key && (
                                            <span className="text-[10px] font-bold text-red-500 animate-pulse">
                                                Selection Required
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {Array.isArray(options) && Array.from(new Set(options)).map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => handleSelect(key, opt)}
                                                className={cn(
                                                    "flex flex-col items-center px-3 py-1.5 rounded-lg border text-sm font-medium transition-all",
                                                    selectedVariations[key] === opt
                                                        ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                                                        : cn(
                                                            "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
                                                            missingSelection === key && "border-red-200 bg-red-50/30"
                                                        )
                                                )}
                                            >
                                                <span>{opt}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <span className="text-sm font-semibold text-slate-700">Quantity</span>
                        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-slate-100"
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                disabled={quantity <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <div className="w-12 text-center font-bold text-slate-800 text-lg">
                                {quantity}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-lg hover:bg-slate-100"
                                onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                                disabled={quantity >= currentStock}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Order Total Preview */}
                    <div className="flex justify-between items-center bg-blue-50 border border-blue-100 rounded-lg px-4 py-2">
                        <span className="text-sm font-semibold text-slate-700">Total</span>
                        <span className="text-blue-700 font-bold">
                            LKR {(currentPrice * quantity).toLocaleString()}
                        </span>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        className="flex-1 text-slate-500 hover:text-slate-700"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold h-11"
                        onClick={handleConfirm}
                        disabled={currentStock <= 0}
                    >
                        <ShoppingCart className="h-5 w-5 mr-2" />
                        {currentStock <= 0 ? "Out of Stock" : "Add to Cart"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
