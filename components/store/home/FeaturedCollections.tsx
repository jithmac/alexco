"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductCard from "../ProductCard";
import { getPosProducts } from "@/server-actions/pos/products";
import { Loader2 } from "lucide-react";

export default function FeaturedCollections() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                // In a real app we'd fetch specific collections. 
                // Here we fetch all and slice for demo.
                const data = await getPosProducts();
                setProducts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Mock filtering for demo purposes
    const bestSellers = products.slice(0, 4);
    const newArrivals = products.slice(4, 8);
    const onSale = products.filter(p => p.price_sale && p.price_sale > 0).slice(0, 4);

    return (
        <section className="py-16 container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-8">Featured Collections</h2>

            <Tabs defaultValue="bestsellers" className="w-full text-center">
                <TabsList className="mb-12 inline-flex relative h-10 items-center justify-center rounded-md bg-slate-100 p-1 text-slate-500">
                    <TabsTrigger value="bestsellers" className="px-4 sm:px-8 text-xs sm:text-sm">Best Sellers</TabsTrigger>
                    <TabsTrigger value="new" className="px-4 sm:px-8 text-xs sm:text-sm">New Arrivals</TabsTrigger>
                    <TabsTrigger value="onsale" className="px-4 sm:px-8 text-xs sm:text-sm">On Sale</TabsTrigger>
                </TabsList>

                <TabsContent value="bestsellers" className="space-y-4 text-left">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {bestSellers.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="new" className="space-y-4 text-left">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {newArrivals.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="onsale" className="space-y-4 text-left">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {onSale.length > 0 ? onSale.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        )) : (
                            <div className="text-center py-12 text-slate-500 col-span-4 bg-slate-50 rounded-lg">
                                No specific sales running today. Check back soon!
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}
