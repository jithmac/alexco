import ProductCard, { ProductProps } from "@/components/store/ProductCard";
import { query } from "@/lib/db";
import { notFound } from "next/navigation";
import { Boxes } from "lucide-react";

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
        title: `${title} | Alexco`,
        description: `Shop the best ${title} at Alexco.`,
    };
}

async function getCategoryProducts(slug: string): Promise<ProductProps[]> {
    try {
        // Map slug to potential DB category terms if needed, or just use broad wildcard
        // Simple mapping for now, can be expanded
        const searchTerm = slug.replace(/-/g, ' ');

        const rows = await query(`
            SELECT id, name, price_retail, price_sale, category_path as category, specifications, sku
            FROM products
            WHERE category_path LIKE ? OR name LIKE ? OR description LIKE ?
            ORDER BY created_at DESC
        `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`]) as any[];

        return rows.map(row => ({
            id: row.id,
            name: row.name,
            price: Number(row.price_sale > 0 ? row.price_sale : row.price_retail),
            price_retail: Number(row.price_retail),
            category: row.category,
            specs: typeof row.specifications === 'string' ? JSON.parse(row.specifications) : row.specifications
        }));
    } catch (error) {
        console.error("Database Error:", error);
        return [];
    }
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const products = await getCategoryProducts(slug);
    const title = slug.charAt(0).toUpperCase() + slug.slice(1);

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="space-y-8">
                {/* Dynamic Header */}
                <div className="bg-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Boxes className="h-48 w-48" />
                    </div>
                    <h1 className="text-4xl font-bold relative z-10">{title}</h1>
                    <p className="mt-2 text-slate-300 max-w-xl relative z-10 capitalize">
                        Browse our collection of {title.replace(/-/g, ' ')}.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p>No products found for "{title}".</p>
                        <p className="text-sm mt-2">Try checking back later for inventory updates.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
