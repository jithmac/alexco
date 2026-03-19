import ProductCard, { ProductProps } from "@/components/store/ProductCard";
import { query } from "@/lib/db";

export const dynamic = 'force-dynamic';

export const metadata = {
    title: "Solar Products | Alexco",
    description: "Shop solar panels, inverters, and complete solar systems in Sri Lanka.",
};

async function getSolarProducts(): Promise<ProductProps[]> {
    try {
        const rows = await query(`
            SELECT id, name, price_retail, price_sale, category_path as category, specifications, sku
            FROM products
            WHERE category_path LIKE '%Solar%' OR name LIKE '%Solar%' OR name LIKE '%Inverter%'
            ORDER BY created_at DESC
        `) as any[];

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

export default async function SolarPage() {
    const products = await getSolarProducts();

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="space-y-8">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-8 text-white">
                    <h1 className="text-4xl font-bold">Solar Systems</h1>
                    <p className="mt-2 text-amber-100 max-w-xl">
                        Harness the power of the sun with our premium solar panels, inverters, and complete off-grid solutions.
                    </p>
                </div>

                {products.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <p>No solar products found.</p>
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
