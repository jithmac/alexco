"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Bolt, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
    product: {
        id: string;
        name: string;
        price: number;
        image?: string;
        stock: number;
        variations?: Record<string, string[]>;
        variation_prices?: Record<string, number>;
        variation_sale_prices?: Record<string, number>;
    }
}

/** Resolve the effective price given the currently selected variations */
function resolveVariantPrices(
    basePrice: number,
    selectedVariations: Record<string, string>,
    variationPrices?: Record<string, number>,
    variationSalePrices?: Record<string, number>,
    allVariations?: Record<string, string[]>
): { effectivePrice: number, originalPrice: number | null } {
    let original = basePrice;
    let effective = basePrice;
    let hasVariantPrice = false;

    if (!variationPrices || Object.keys(variationPrices).length === 0) {
        return { effectivePrice: effective, originalPrice: null };
    }

    // If all variations are selected, assemble the combo string and lookup
    let comboKey = "";
    if (allVariations) {
        const totalGroups = Object.keys(allVariations).length;
        const selectedEntries = Object.entries(selectedVariations);

        if (selectedEntries.length === totalGroups) {
            comboKey = selectedEntries
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([k, v]) => `${k}:${v}`)
                .join('; ');
        }
    }

    if (comboKey && variationPrices[comboKey] !== undefined && variationPrices[comboKey] > 0) {
        original = variationPrices[comboKey];
        effective = original;
        hasVariantPrice = true;
    }

    if (comboKey && variationSalePrices && variationSalePrices[comboKey] !== undefined && variationSalePrices[comboKey] > 0) {
        effective = variationSalePrices[comboKey];
    }

    // Fallback logic
    if (!hasVariantPrice) {
        for (const [type, value] of Object.entries(selectedVariations)) {
            const key = `${type}:${value}`;
            if (variationPrices[key] !== undefined && variationPrices[key] > 0) {
                original = variationPrices[key];
                effective = original;
            }
            if (variationSalePrices && variationSalePrices[key] !== undefined && variationSalePrices[key] > 0) {
                effective = variationSalePrices[key];
            }
        }
    }

    return {
        effectivePrice: effective,
        originalPrice: effective !== original ? original : null
    };
}

export default function ProductActions({ product }: ProductActionsProps) {
    const { addItem } = useCart();
    const { toast } = useToast();
    const router = useRouter();

    const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
    const [missingSelection, setMissingSelection] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { effectivePrice: currentPrice, originalPrice } = resolveVariantPrices(
        product.price,
        selectedVariations,
        product.variation_prices,
        product.variation_sale_prices,
        product.variations
    );
    const priceChanged = originalPrice !== null || currentPrice !== product.price;

    const handleSelect = (key: string, value: string) => {
        setSelectedVariations(prev => ({ ...prev, [key]: value }));
        if (missingSelection === key) setMissingSelection(null);
    };

    const validateSelections = () => {
        if (!product.variations) return true;
        for (const key of Object.keys(product.variations)) {
            if (!selectedVariations[key]) {
                setMissingSelection(key);
                toast({
                    title: `Please select a ${key}`,
                    variant: "destructive",
                    duration: 2000
                });
                return false;
            }
        }
        return true;
    };

    const handleAddToCart = () => {
        if (!validateSelections()) return;

        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: currentPrice,
            quantity: quantity,
            image: product.image || "/placeholder.jpg",
            variations: selectedVariations
        });
        toast({
            title: "Added to Cart",
            description: `${product.name} added to your cart.`
        });
    };

    const handleBuyNow = () => {
        if (!validateSelections()) return;
        handleAddToCart();
        router.push("/shop/checkout");
    };

    const hasVariations = product.variations && Object.keys(product.variations).length > 0;

    return (
        <div className="space-y-6">
            {/* Live Price Display */}
            {hasVariations && (
                <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-slate-900">
                        LKR {currentPrice.toLocaleString()}
                    </span>
                    {priceChanged && (
                        <span className="text-sm text-slate-400 line-through">
                            LKR {(originalPrice || product.price).toLocaleString()}
                        </span>
                    )}
                    {!priceChanged && Object.keys(selectedVariations).length === 0 && product.variation_prices && Object.keys(product.variation_prices).length > 0 && (
                        <span className="text-xs text-slate-500 italic">Select a variant to see price</span>
                    )}
                </div>
            )}

            {hasVariations && (
                <div className="space-y-4 py-2">
                    {Object.entries(product.variations!).map(([key, options]) => (
                        <div key={key}>
                            <h4 className="text-sm font-medium text-slate-900 mb-2">
                                {key} {missingSelection === key && <span className="text-red-500">* Required</span>}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(options) && options.map((opt: string) => (
                                    <button
                                        key={opt}
                                        onClick={() => handleSelect(key, opt)}
                                        className={cn(
                                            "flex flex-col items-center px-4 py-2 rounded-md border text-sm font-medium transition-all",
                                            selectedVariations[key] === opt
                                                ? "border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600"
                                                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50",
                                            missingSelection === key && !selectedVariations[key] && "border-red-300 bg-red-50"
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
            <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-700">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="h-10 w-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-12 text-center font-semibold text-slate-900 border-x border-slate-200">{quantity}</span>
                    <button
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                        className="h-10 w-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors"
                        disabled={quantity >= product.stock}
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Button
                    size="lg"
                    className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-lg h-14 border-slate-300"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                >
                    <Bolt className="mr-2 h-5 w-5" />
                    Buy Now
                </Button>
            </div>
        </div>
    );
}
