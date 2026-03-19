"use server";

import { query } from "@/lib/db";

export async function getFilterOptions() {
    try {
        // Get active categories
        const categories = await query(`
            SELECT slug, name 
            FROM categories 
            WHERE is_active = TRUE 
            ORDER BY order_index ASC, name ASC
        `) as any[];

        // Get price range
        const [priceRange] = await query(`
            SELECT 
                MIN(CAST(price_retail AS DECIMAL(10,2))) as min_price, 
                MAX(CAST(price_retail AS DECIMAL(10,2))) as max_price
            FROM products
            WHERE inventory_strategy != 'DISCONTINUED' AND is_active = TRUE
        `) as any[];

        return {
            categories: categories.map(c => ({ name: c.name, slug: c.slug })),
            priceRange: {
                min: Number(priceRange?.min_price) || 0,
                max: Number(priceRange?.max_price) || 100000
            }
        };
    } catch (e) {
        console.error("Get Filter Options Error:", e);
        return { categories: [], priceRange: { min: 0, max: 100000 } };
    }
}

export async function getFilteredProducts(filters: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    sortBy?: 'price_asc' | 'price_desc' | 'name' | 'newest';
    page?: number;
    limit?: number;
}) {
    try {
        const { category, minPrice, maxPrice, search, sortBy = 'name', page = 1, limit = 16 } = filters;

        const whereClauses = ["inventory_strategy != 'DISCONTINUED'", "is_active = TRUE"];
        const params: any[] = [];

        if (category) {
            // Fetch all categories to determine hierarchy
            // (Caching this would be better for performance, but this is safe for now)
            const allCats = await query('SELECT id, parent_id, slug FROM categories WHERE is_active = TRUE') as any[];

            const targetCat = allCats.find(c => c.slug === category);

            if (targetCat) {
                const slugsToInclude = [category];

                // Find all descendants recursively
                const findDescendants = (parentId: string) => {
                    const children = allCats.filter(c => c.parent_id === parentId);
                    children.forEach(child => {
                        slugsToInclude.push(child.slug);
                        findDescendants(child.id);
                    });
                };

                findDescendants(targetCat.id);

                // Create placeholders for prepared statement
                const placeholders = slugsToInclude.map(() => '?').join(',');
                whereClauses.push(`category_path IN (${placeholders})`);
                params.push(...slugsToInclude);
            } else {
                // Fallback for direct match if not found in list (e.g. inactive)
                whereClauses.push("category_path = ?");
                params.push(category);
            }
        }

        if (minPrice !== undefined) {
            whereClauses.push("CAST(price_retail AS DECIMAL(10,2)) >= ?");
            params.push(minPrice);
        }

        if (maxPrice !== undefined) {
            whereClauses.push("CAST(price_retail AS DECIMAL(10,2)) <= ?");
            params.push(maxPrice);
        }

        if (search) {
            whereClauses.push("(name LIKE ? OR sku LIKE ? OR description LIKE ?)");
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

        console.log(`Filter Request: category=${category}, sortBy=${sortBy}, search=${search}`);
        console.log(`Generated WHERE: ${whereSQL}`);

        // Sorting
        let orderBy = 'name ASC';
        switch (sortBy) {
            case 'price_asc': orderBy = 'CAST(price_retail AS DECIMAL(10,2)) ASC'; break;
            case 'price_desc': orderBy = 'CAST(price_retail AS DECIMAL(10,2)) DESC'; break;
            case 'newest': orderBy = 'p.created_at DESC'; break;
            case 'name': default: orderBy = 'name ASC';
        }

        // Count total
        const [countResult] = await query(`SELECT COUNT(*) as total FROM products ${whereSQL}`, params) as any[];
        const total = countResult?.total || 0;

        // Get products with pagination
        const offset = (page - 1) * limit;
        const products = await query(`
            SELECT 
                p.id, p.name, p.sku, p.description, p.category_path,
                p.price_retail, p.price_sale, p.image, p.gallery,
                COALESCE(SUM(l.delta), 0) as stock
            FROM products p
            LEFT JOIN inventory_ledger l ON p.id = l.product_id
            ${whereSQL}
            GROUP BY p.id
            ORDER BY ${orderBy}
            LIMIT ? OFFSET ?
        `, [...params, limit.toString(), offset.toString()]) as any[];

        return {
            products: products.map(p => {
                const gallery = typeof p.gallery === 'string' ? JSON.parse(p.gallery) : p.gallery;
                const mainImage = (Array.isArray(gallery) && gallery.length > 0) ? gallery[0] : p.image;

                return {
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    description: p.description,
                    category: p.category_path,
                    price: Number(p.price_sale) > 0 ? Number(p.price_sale) : Number(p.price_retail),
                    price_retail: Number(p.price_retail),
                    price_sale: Number(p.price_sale),
                    image: mainImage,
                    stock: Number(p.stock)
                };
            }),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    } catch (e: any) {
        console.error("Get Filtered Products Error:", e);
        return {
            products: [],
            total: 0,
            page: 1,
            totalPages: 0,
            error: e.message || "Unknown error occurred"
        };
    }
}
