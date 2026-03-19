"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { getCategorySlug } from "./categories";

export type ProductImportData = {
    name: string;
    sku: string;
    category: string; // Name or ID
    price: string | number;
    price_cost?: string | number;
    price_sale?: string | number;
    initialStock?: string | number;
    description?: string;
    long_description?: string;
    weight_g?: string | number;
    variations?: string; // "Color=Red,Blue;Size=S,M"
    variation_prices?: string; // "Color:Red;Size:S=1500|Color:Blue;Size:M=1600"
    variation_sale_prices?: string; // "Color:Red;Size:S=1200|Color:Blue;Size:M=1300"
    variant_stocks?: string; // "Color:Red;Size:S=10|Color:Blue;Size:M=5"
    specifications?: string; // "Key:Value;Key:Value"
    features?: string; // "Feat1;Feat2"
    whats_included?: string; // "Item1;Item2"
};

export async function importProducts(products: ProductImportData[]) {
    try {
        await requirePermission('inventory.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const results = {
        total: products.length,
        created: 0,
        errors: [] as string[]
    };

    // Pre-fetch categories to map names to slugs/IDs
    const categories = await query("SELECT id, name, slug, parent_id FROM categories") as any[];
    const categoryMap = new Map<string, string>(); // Name -> Slug
    const categoryIdMap = new Map<string, string>(); // ID -> Slug
    const categoryPathMap = new Map<string, string>(); // "Parent > Child" -> Slug

    // Helper to build full path for a category
    const buildPath = (cat: any): string => {
        if (!cat.parent_id) return cat.name.trim();
        const parent = categories.find(c => c.id === cat.parent_id);
        return parent ? `${buildPath(parent)} > ${cat.name.trim()}` : cat.name.trim();
    };

    categories.forEach(c => {
        // 1. Map ID -> Slug
        categoryIdMap.set(c.id, c.slug);

        // 2. Map Name -> Slug (for simple matches)
        categoryMap.set(c.name.toLowerCase().trim(), c.slug);

        // 3. Map Slug -> Slug
        categoryMap.set(c.slug.toLowerCase().trim(), c.slug);

        // 4. Map Full Path -> Slug (e.g. "Electrical > Lighting")
        const fullPath = buildPath(c).toLowerCase().replace(/\s+>\s+/g, ' > ');
        categoryPathMap.set(fullPath, c.slug);
    });

    for (const p of products) {
        try {
            // Validation
            if (!p.name || !p.sku || !p.price || !p.category) {
                results.errors.push(`Skipped ${p.name || 'Unknown'}: Missing required fields.`);
                continue;
            }

            // Category Matching
            const normalizedCat = p.category.toLowerCase().trim().replace(/\s+>\s+/g, ' > ');
            let categorySlug =
                categoryIdMap.get(p.category) ||
                categoryPathMap.get(normalizedCat) ||
                categoryMap.get(normalizedCat);

            // Phase 5 Enhancement: Better category matching or fallback
            if (!categorySlug) {
                // Try to match by partial name if exact match fails?
                // Or just default to 'Uncategorized' if it exists, or create it?
                // For now, strict match to avoid data mess.
                results.errors.push(`Skipped ${p.name}: Category '${p.category}' not found.`);
                continue;
            }

            // Check if SKU exists
            const [existing] = await query("SELECT id FROM products WHERE sku = ?", [p.sku]) as any[];
            if (existing) {
                results.errors.push(`Skipped ${p.name}: SKU '${p.sku}' already exists.`);
                continue;
            }

            const productId = uuidv4();

            // Parse variations
            let variations = {};
            if (p.variations && typeof p.variations === 'string') {
                try {
                    variations = p.variations.split(';').reduce((acc: any, part) => {
                        const [key, values] = part.split('=').map(s => s.trim());
                        if (key && values) {
                            acc[key] = values.split(',').map(v => v.trim());
                        }
                        return acc;
                    }, {});
                } catch (e) {
                    // Ignore parse error
                }
            }

            // Parse variation_prices
            let variationPrices: Record<string, number> = {};
            if (p.variation_prices && typeof p.variation_prices === 'string') {
                try {
                    variationPrices = p.variation_prices.split('|').reduce((acc: Record<string, number>, part) => {
                        const [key, val] = part.split('=').map(s => s.trim());
                        const parsedVal = parseFloat(val);
                        if (key && !isNaN(parsedVal) && parsedVal > 0) {
                            acc[key] = parsedVal;
                        }
                        return acc;
                    }, {});
                } catch (e) { }
            }

            // Parse variation_sale_prices
            let variationSalePrices: Record<string, number> = {};
            if (p.variation_sale_prices && typeof p.variation_sale_prices === 'string') {
                try {
                    variationSalePrices = p.variation_sale_prices.split('|').reduce((acc: Record<string, number>, part) => {
                        const [key, val] = part.split('=').map(s => s.trim());
                        const parsedVal = parseFloat(val);
                        if (key && !isNaN(parsedVal) && parsedVal >= 0) {
                            acc[key] = parsedVal;
                        }
                        return acc;
                    }, {});
                } catch (e) { }
            }

            // Parse variant_stocks
            let variantStocks: Record<string, number> = {};
            if (p.variant_stocks && typeof p.variant_stocks === 'string') {
                try {
                    variantStocks = p.variant_stocks.split('|').reduce((acc: Record<string, number>, part) => {
                        const [key, val] = part.split('=').map(s => s.trim());
                        const parsedVal = parseInt(val);
                        if (key && !isNaN(parsedVal) && parsedVal > 0) {
                            acc[key] = parsedVal;
                        }
                        return acc;
                    }, {});
                } catch (e) { }
            }

            // Parse Specifications (Key:Value; Key:Value)
            let specifications = {};
            if (p.specifications && typeof p.specifications === 'string') {
                try {
                    specifications = p.specifications.split(';').reduce((acc: any, part) => {
                        const [key, val] = part.split(':').map(s => s.trim());
                        if (key && val) acc[key] = val;
                        return acc;
                    }, {});
                } catch (e) { }
            }

            // Parse Features (Item; Item)
            let features: string[] = [];
            if (p.features && typeof p.features === 'string') {
                features = p.features.split(';').map(s => s.trim()).filter(Boolean);
            }

            // Parse Whats Included (Item; Item)
            let whatsIncluded: string[] = [];
            if (p.whats_included && typeof p.whats_included === 'string') {
                whatsIncluded = p.whats_included.split(';').map(s => s.trim()).filter(Boolean);
            }

            // Insert Product
            await query(`
                INSERT INTO products (
                    id, sku, name, category_path, price_retail, price_cost, price_sale, tax_code, 
                    description, long_description, variations, variation_prices, variation_sale_prices, specifications, whats_included, features, gallery, image, weight_g
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, 'VAT_18', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                productId,
                p.sku,
                p.name,
                categorySlug,
                p.price,
                p.price_cost || 0,
                p.price_sale || 0,
                p.description || '',
                p.long_description || '',
                JSON.stringify(variations),
                JSON.stringify(variationPrices),
                JSON.stringify(variationSalePrices),
                JSON.stringify(specifications),
                JSON.stringify(whatsIncluded),
                JSON.stringify(features),
                JSON.stringify([]), // Gallery
                null, // Main Image
                Number(p.weight_g) || 0
            ]);

            // Initial Stock (Base + Variables)
            const initialStock = Number(p.initialStock);
            const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];

            if (loc) {
                // Base generic stock
                if (initialStock > 0) {
                    await query(`
                        INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                        VALUES (?, ?, ?, ?, 'INITIAL_STOCK', 'IMPORT')
                    `, [uuidv4(), productId, loc.id, initialStock]);
                }

                // Specific combination variant stock
                for (const [vKey, vStock] of Object.entries(variantStocks)) {
                    if (vStock > 0) {
                        await query(`
                            INSERT INTO inventory_ledger (transaction_id, product_id, location_id, variant_id, delta, reason_code, reference_doc)
                            VALUES (?, ?, ?, ?, ?, 'INITIAL_STOCK', 'IMPORT')
                        `, [uuidv4(), productId, loc.id, vKey, vStock]);
                    }
                }
            }

            results.created++;

        } catch (err: any) {
            console.error(`Error importing ${p.name}:`, err);
            results.errors.push(`Error importing ${p.name}: ${err.message}`);
        }
    }

    revalidatePath('/paths/admin/inventory');
    revalidatePath('/shop');

    return results;
}
