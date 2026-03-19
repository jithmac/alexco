import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Check, Truck, Shield, Box } from "lucide-react";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import ProductActions from "@/components/store/ProductActions";
import ProductCard from "@/components/store/ProductCard";
import Image from "next/image";

export const metadata = {
    title: "Product Details | Alexco",
};

async function getProduct(id: string) {
    try {
        const rows = await query(`
      SELECT * FROM products WHERE id = ?
    `, [id]) as any[];

        if (rows.length === 0) return null;

        const row = rows[0];

        // Helper to parse JSON safely
        const data = (field: any) => {
            if (!field) return null;
            return typeof field === 'string' ? JSON.parse(field) : field;
        };

        const specs = data(row.specifications);
        const features = data(row.features);
        const included = data(row.whats_included);
        const variations = data(row.variations);
        const variation_prices = data(row.variation_prices);
        const variation_sale_prices = data(row.variation_sale_prices);
        const gallery = data(row.gallery);

        // Inventory check
        const inventory = await query(`
        SELECT SUM(delta) as stock FROM inventory_ledger WHERE product_id = ?
    `, [id]) as any[];

        const stock = Number(inventory[0]?.stock || 0);

        // Construct images array: Gallery > Image > Empty
        let images: string[] = [];
        if (Array.isArray(gallery) && gallery.length > 0) {
            images = gallery;
        } else if (row.image) {
            images = [row.image];
        }

        return {
            id: row.id,
            name: row.name,
            price_retail: Number(row.price_retail),
            price_sale: Number(row.price_sale),
            price_cost: Number(row.price_cost),
            category: row.category_path,
            description: row.description || "No short description available.",
            long_description: row.long_description,
            sku: row.sku,
            stock,
            specs,
            features,
            included,
            variations,
            variation_prices,
            variation_sale_prices,
            warranty_period: row.warranty_period,
            warranty_policy: row.warranty_policy,
            video_url: row.video_url,
            images // Pass array of images
        };
    } catch (error) {
        console.error(error);
        return null;
    }
}

async function getRelatedProducts(category: string, excludeId: string) {
    try {
        const rows = await query(`
            SELECT id, name, price_retail, price_sale, image, gallery, category_path 
            FROM products 
            WHERE category_path = ? AND id != ? AND inventory_strategy != 'DISCONTINUED'
            ORDER BY RAND()
            LIMIT 4
        `, [category, excludeId]) as any[];

        return rows.map(r => {
            const gallery = typeof r.gallery === 'string' ? JSON.parse(r.gallery) : r.gallery;
            const mainImage = (Array.isArray(gallery) && gallery.length > 0) ? gallery[0] : r.image;

            return {
                id: r.id,
                name: r.name,
                price: Number(r.price_sale) > 0 ? Number(r.price_sale) : Number(r.price_retail),
                price_retail: Number(r.price_retail),
                category: r.category_path,
                image: mainImage
            };
        });
    } catch (e) {
        console.error(e);
        return [];
    }
}

import ProductGallery from "@/components/store/ProductGallery";

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.category || '', id);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
                {/* Gallery Section */}
                <ProductGallery images={product.images} videoUrl={product.video_url} name={product.name} />

                {/* Basic Info Section */}
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-700">{product.category}</Badge>
                            {product.stock > 0 ? (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none">In Stock</Badge>
                            ) : (
                                <Badge variant="destructive">Out of Stock</Badge>
                            )}
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">{product.name}</h1>
                        <div className="text-sm text-slate-500 mt-2 font-mono">SKU: {product.sku}</div>
                    </div>

                    {/* Price Block */}
                    <div className="flex items-baseline gap-2 sm:gap-4 flex-wrap mt-6">
                        {product.price_sale > 0 && product.price_sale < product.price_retail ? (
                            <>
                                <span className="text-3xl font-bold text-red-600">
                                    LKR {Number(product.price_sale).toLocaleString()}
                                </span>
                                <span className="text-lg text-slate-400 line-through">
                                    LKR {Number(product.price_retail).toLocaleString()}
                                </span>
                                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                                    {Math.round(((product.price_retail - product.price_sale) / product.price_retail) * 100)}% OFF
                                </span>
                            </>
                        ) : (
                            <span className="text-3xl font-bold text-slate-900">
                                LKR {Number(product.price_retail).toLocaleString()}
                            </span>
                        )}
                    </div>

                    <Separator />

                    <p className="text-slate-600 text-lg leading-relaxed">
                        {product.description}
                    </p>


                    <ProductActions product={{
                        id: product.id,
                        name: product.name,
                        price: product.price_sale > 0 ? product.price_sale : product.price_retail,
                        image: product.images[0],
                        stock: product.stock,
                        variations: product.variations,
                        variation_prices: product.variation_prices,
                        variation_sale_prices: product.variation_sale_prices
                    }} />

                    {/* Quick Benefits */}
                    <div className="grid grid-cols-1 gap-4 text-sm text-slate-600 pt-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <div className="flex items-center gap-3">
                            <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                            <span>Availability: <span className="font-semibold text-slate-900">{product.stock} units</span> ready to ship</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Truck className="h-5 w-5 text-blue-500 flex-shrink-0" />
                            <span>Delivery: <span className="font-semibold text-slate-900">Island-wide (2-3 Business Days)</span></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield className="h-5 w-5 text-amber-500 flex-shrink-0" />
                            <span>Warranty: <span className="font-semibold text-slate-900">{product.warranty_period || 'Standard Manufacturer Warranty'}</span></span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Tabs Section */}
            <div className="mt-16">
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 sm:inline-flex bg-slate-100 p-1 mb-6 sm:mb-8">
                        <TabsTrigger value="overview" className="px-3 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-base">Overview</TabsTrigger>
                        <TabsTrigger value="specs" className="px-3 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-base">Specifications</TabsTrigger>
                        <TabsTrigger value="box" className="px-3 sm:px-8 py-2 sm:py-2.5 text-xs sm:text-base">In the Box</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="grid md:grid-cols-3 gap-12">
                            <div className="md:col-span-2 space-y-6">
                                <h3 className="text-2xl font-bold text-slate-900">Product Description</h3>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                    <p>{product.long_description || product.description || "Detailed description coming soon."}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Key Features</h3>
                                <ul className="space-y-3">
                                    {product.features && product.features.length > 0 ? (
                                        product.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-3 text-slate-600">
                                                <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-slate-400 italic">No specific features listed.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="specs" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left min-w-[400px]">
                                    <thead className="bg-slate-50 text-slate-900 font-semibold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4 w-1/3">Specification</th>
                                            <th className="px-4 sm:px-6 py-3 sm:py-4">Detail</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {product.specs && Object.entries(product.specs).map(([key, val]) => (
                                            <tr key={key} className="hover:bg-slate-50/50">
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 font-medium text-slate-600">{key}</td>
                                                <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-900">{String(val)}</td>
                                            </tr>
                                        ))}
                                        {!product.specs && (
                                            <tr>
                                                <td colSpan={2} className="px-4 sm:px-6 py-8 text-center text-slate-400">No specifications available.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </TabsContent>

                    <TabsContent value="box" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Box className="h-5 w-5 text-slate-500" />
                                What's Included
                            </h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {product.included && product.included.length > 0 ? (
                                    product.included.map((item: string, idx: number) => (
                                        <div key={idx} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                            <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {idx + 1}
                                            </div>
                                            <span className="font-medium text-slate-700">{item}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">Box contents not specified.</p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-slate-900 mb-8">You Might Also Like</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {relatedProducts.map((related) => (
                            <ProductCard key={related.id} product={related} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
