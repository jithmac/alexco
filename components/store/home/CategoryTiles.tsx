"use client";

import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { getCategories, Category } from "@/server-actions/admin/categories";

export default function CategoryTiles() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCategories(false).then(cats => {
            // Filter top-level categories or specific "featured" logic
            // For now, let's take top level categories
            const topLevel = cats.filter(c => !c.parent_id);
            setCategories(topLevel.slice(0, 8)); // Limit to 8
            setLoading(false);
        });
    }, []);

    if (loading) return null; // or skeleton

    return (
        <section className="py-12 bg-slate-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-slate-900">Shop by Category</h2>
                    <Link href="/shop" className="text-blue-600 font-medium flex items-center hover:underline">
                        View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group flex flex-col items-center text-center"
                        >
                            <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-slate-100 overflow-hidden group-hover:scale-110 transition-transform">
                                {cat.image ? (
                                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-slate-400" />
                                )}
                            </div>
                            <h3 className="font-semibold text-slate-900 line-clamp-1">{cat.name}</h3>
                            <span className="text-xs text-slate-500 mt-1">{cat.product_count || 0} Items</span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
