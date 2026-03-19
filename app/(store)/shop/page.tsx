"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Filter, ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import ShopFilters from "@/components/store/ShopFilters";
import { getFilterOptions, getFilteredProducts } from "@/server-actions/store/filters";

function ShopContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // State
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterOptions, setFilterOptions] = useState<{ categories: { name: string; slug: string }[]; priceRange: { min: number; max: number } }>({
        categories: [],
        priceRange: { min: 0, max: 100000 }
    });
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
    const [error, setError] = useState<string | null>(null);

    // Read filters from URL
    const category = searchParams.get("category") || undefined;
    const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
    const sortBy = (searchParams.get("sortBy") as any) || "name";
    const search = searchParams.get("search") || undefined;
    const page = Number(searchParams.get("page")) || 1;

    // Load filter options on mount
    useEffect(() => {
        async function loadOptions() {
            const opts = await getFilterOptions();
            setFilterOptions(opts);
        }
        loadOptions();
    }, []);

    // Load products when filters change
    useEffect(() => {
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const result = await getFilteredProducts({
                    category,
                    minPrice,
                    maxPrice,
                    search,
                    sortBy,
                    page,
                    limit: 16
                });

                if (result.error) {
                    setError(result.error);
                }

                setProducts(result.products);
                setPagination({ total: result.total, page: result.page, totalPages: result.totalPages });
            } catch (e) {
                console.error(e);
                setError("Failed to load products");
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [category, minPrice, maxPrice, search, sortBy, page]);

    // Handle filter changes
    const updateFilters = useCallback((newFilters: Record<string, any>) => {
        const params = new URLSearchParams(searchParams.toString());

        // Reset page when filters change
        if (newFilters.category !== undefined || newFilters.minPrice !== undefined || newFilters.maxPrice !== undefined || newFilters.sortBy !== undefined) {
            params.delete("page");
        }

        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === undefined || value === '' || value === null) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }
        });

        router.push(`/shop?${params.toString()}`);
    }, [searchParams, router]);

    const clearFilters = () => {
        router.push('/shop');
    };

    const goToPage = (newPage: number) => {
        updateFilters({ page: newPage });
    };

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-12 px-4">
                <div className="container mx-auto text-center space-y-3">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                        {search ? `Search: "${search}"` : "Our Products"}
                    </h1>
                    <p className="text-slate-300 max-w-xl mx-auto">
                        {search ? `${pagination.total} results found` : "Browse our complete catalog of premium products"}
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <main className="container mx-auto py-8 px-4">
                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <ShopFilters
                            categories={filterOptions.categories}
                            priceRange={filterOptions.priceRange}
                            selectedCategory={category}
                            selectedPriceRange={minPrice !== undefined && maxPrice !== undefined ? [minPrice, maxPrice] : undefined}
                            sortBy={sortBy}
                            onFilterChange={updateFilters}
                            onClearFilters={clearFilters}
                        />
                    </aside>

                    {/* Product Grid Area */}
                    <div className="flex-1">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6 gap-4">
                            {/* Mobile Filter Button */}
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden">
                                        <Filter className="h-4 w-4 mr-2" /> Filters
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80 p-0">
                                    <div className="p-4">
                                        <ShopFilters
                                            categories={filterOptions.categories}
                                            priceRange={filterOptions.priceRange}
                                            selectedCategory={category}
                                            selectedPriceRange={minPrice !== undefined && maxPrice !== undefined ? [minPrice, maxPrice] : undefined}
                                            sortBy={sortBy}
                                            onFilterChange={updateFilters}
                                            onClearFilters={clearFilters}
                                        />
                                    </div>
                                </SheetContent>
                            </Sheet>

                            <div className="hidden lg:block text-sm text-slate-500">
                                Showing {products.length} of {pagination.total} products
                            </div>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm text-slate-500 hidden sm:inline">Sort:</span>
                                <Select value={sortBy} onValueChange={(val) => updateFilters({ sortBy: val })}>
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name A-Z</SelectItem>
                                        <SelectItem value="price_asc">Price: Low to High</SelectItem>
                                        <SelectItem value="price_desc">Price: High to Low</SelectItem>
                                        <SelectItem value="newest">Newest First</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>


                        {/* Error Banner */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                                <p className="font-bold">Error Loading Products:</p>
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Products Grid */}
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="h-[320px] bg-slate-100 rounded-xl animate-pulse" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-slate-50 rounded-xl">
                                <p className="text-slate-500 text-lg mb-4">No products found matching your criteria.</p>
                                <Button onClick={clearFilters}>Clear Filters</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                                {products.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-12">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={pagination.page <= 1}
                                    onClick={() => goToPage(pagination.page - 1)}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>

                                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                                    let pageNum = i + 1;
                                    if (pagination.totalPages > 5) {
                                        const start = Math.max(1, pagination.page - 2);
                                        pageNum = start + i;
                                        if (pageNum > pagination.totalPages) return null;
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pagination.page === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={pagination.page >= pagination.totalPages}
                                    onClick={() => goToPage(pagination.page + 1)}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </>
    );
}

export default function ShopPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto py-20 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            </div>
        }>
            <ShopContent />
        </Suspense>
    );
}
