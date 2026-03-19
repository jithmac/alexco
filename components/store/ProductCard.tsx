"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export interface ProductProps {
    id: string;
    name: string;
    price: number;
    price_retail?: number;
    price_sale?: number;
    category?: string;
    image?: string;
    specs?: Record<string, any>;
    stock?: number;
    variation_prices?: Record<string, number>;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const { addItem } = useCart();
    const { toast } = useToast();
    const router = useRouter();

    const salePrice = product.price_sale && product.price_sale > 0 ? product.price_sale : null;
    const displayPrice = salePrice || product.price;
    const originalPrice = salePrice ? product.price_retail || product.price : product.price_retail;
    const discount = originalPrice && originalPrice > displayPrice
        ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
        : 0;

    // Variation pricing: show "From LKR X" with the minimum variation price
    const variationPrices = product.variation_prices;
    const hasVariationPricing = variationPrices && Object.keys(variationPrices).length > 0;
    const minVariationPrice = hasVariationPricing
        ? Math.min(...Object.values(variationPrices!).filter(v => v > 0))
        : null;

    const isOutOfStock = product.stock !== undefined && product.stock <= 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isOutOfStock) return;

        addItem({
            id: product.id,
            productId: product.id,
            name: product.name,
            price: displayPrice,
            quantity: 1,
            image: product.image || "/placeholder.jpg"
        });
        toast({
            title: "Added to Cart",
            description: `${product.name} added to your cart.`
        });
    };

    return (
        <Card className="relative overflow-hidden group h-full flex flex-col border-0 shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-xl">
            {/* Full Card Link Overlay */}
            <Link href={`/shop/product/${product.id}`} className="absolute inset-0 z-10" prefetch={false}>
                <span className="sr-only">View {product.name}</span>
            </Link>

            {/* Image Area */}
            <div className="relative aspect-square bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={product.image.startsWith('/uploads')}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl opacity-10">⚡</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 z-20">
                    {discount > 0 && (
                        <Badge className="bg-red-500 hover:bg-red-500 text-white text-[10px] font-bold px-2">
                            -{discount}%
                        </Badge>
                    )}
                    {isOutOfStock && (
                        <Badge variant="secondary" className="text-[10px]">
                            Out of Stock
                        </Badge>
                    )}
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 z-20 pointer-events-none">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full bg-white hover:bg-blue-600 hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 pointer-events-auto"
                        onClick={handleAddToCart}
                        disabled={isOutOfStock}
                    >
                        <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 rounded-full bg-white hover:bg-blue-600 hover:text-white transition-colors shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75 pointer-events-auto"
                        onClick={(e) => { e.preventDefault(); router.push(`/shop/product/${product.id}`); }}
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-4 flex-1 flex flex-col pointer-events-none">
                {product.category && (
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">
                        {product.category}
                    </div>
                )}
                <div className="block">
                    <h3 className="font-semibold text-slate-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Spec Tags */}
                {product.specs && Object.keys(product.specs).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {Object.entries(product.specs).slice(0, 2).map(([key, val]) => (
                            <span key={key} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                {key}: {val}
                            </span>
                        ))}
                    </div>
                )}

                {/* Price */}
                <div className="mt-auto pt-3">
                    {hasVariationPricing && minVariationPrice ? (
                        <div className="flex items-baseline gap-2">
                            <span className="text-xs text-slate-500 font-medium">From</span>
                            <span className="text-lg font-bold text-slate-900">
                                LKR {minVariationPrice.toLocaleString()}
                            </span>
                        </div>
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-slate-900">
                                LKR {displayPrice.toLocaleString()}
                            </span>
                            {originalPrice && originalPrice > displayPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                    {originalPrice.toLocaleString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>

            {/* Quick Add Button (Mobile Friendly) */}
            <div className="p-4 pt-0 lg:hidden relative z-20">
                <Button
                    className="w-full"
                    size="sm"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                </Button>
            </div>
        </Card>
    );
}
