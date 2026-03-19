"use server";

import { query } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { getCategoryPath, getCategorySlug } from "./categories";

export type InventoryConflict = {
    productId: string;
    productName: string;
    sku: string;
    stockLevel: number; // Will be negative
    lastTransactionId: string;
};

export async function getInventoryConflicts(): Promise<InventoryConflict[]> {
    try {
        // A simplified conflict check: sum of ledger is negative
        const rows = await query(`
      SELECT p.id, p.name, p.sku, SUM(l.delta) as current_stock
      FROM products p
      JOIN inventory_ledger l ON p.id = l.product_id
      GROUP BY p.id
      HAVING current_stock < 0
    `) as any[];

        return rows.map(r => ({
            productId: r.id,
            productName: r.name,
            sku: r.sku,
            stockLevel: Number(r.current_stock),
            lastTransactionId: "unknown" // In real app, would fetch last ledger entry
        }));
    } catch (err) {
        console.error("Failed to fetch conflicts:", err);
        return [];
    }
}

export async function resolveConflict(productId: string, resolution: "BACKORDER" | "REFUND" | "ADJUST", amount: number) {
    try {
        console.log(`Resolving conflict for ${productId} with ${resolution} of ${amount}`);

        let delta = 0;
        let reason = "";

        if (resolution === 'ADJUST' || resolution === 'BACKORDER') {
            // Add stock to bring it to 0 or positive. 
            // BUT wait, if we are "Backordering", it means we are acknowledging the negative stock and maybe moving it to a "Pending" bucket?
            // For simplicity in Phase 5: "Resolve" just means "Add Adjustment Stock" to balance the books, assuming we sourced the item physically or cancelled an order.

            delta = amount; // Should be positive to fix negative
            reason = `ADMIN_RES_${resolution}`;
        }

        if (delta !== 0) {
            const { v4: uuidv4 } = await import('uuid');
            // Fetch a location (Main Store)
            const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];
            const locId = loc.id;

            await query(`
                INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                VALUES (?, ?, ?, ?, ?, 'ADMIN_FIX')
             `, [uuidv4(), productId, locId, delta, reason]);
        }

        return { success: true };

    } catch (err) {
        console.error("Resolution failed:", err);
        return { success: false, error: "Failed to resolve" };
    }
}

// --- New Features for Phase 5 Completion ---

export async function getInventoryList(search?: string) {
    try {
        await requirePermission('inventory.view');
    } catch (e) {
        throw new Error("Unauthorized: Missing inventory.view permission");
    }

    // Simplified query to ensure we catch all stock including variants
    let sql = `
        SELECT 
            p.id, p.sku, p.name, p.category_path, p.price_retail, p.price_cost, p.price_sale,
            p.weight_g, p.description, p.long_description, p.variations, p.variation_prices, p.variation_sale_prices, p.image, p.gallery,
            p.video_url,
            p.specifications, p.whats_included, p.features, p.is_active,
            COALESCE(SUM(l.delta), 0) as current_stock
        FROM products p
        LEFT JOIN inventory_ledger l ON p.id = l.product_id
    `;

    const params: any[] = [];

    if (search) {
        sql += ` WHERE p.name LIKE ? OR p.sku LIKE ? `;
        params.push(`%${search}%`, `%${search}%`);
    }

    sql += ` GROUP BY p.id ORDER BY p.name ASC LIMIT 50`;

    const rows = await query(sql, params) as any[];
    // verify stock count to be safe
    rows.forEach(r => {
        r.current_stock = Number(r.current_stock);
        r.is_active = Boolean(r.is_active);
    });

    return rows;
}

export async function createProduct(data: any) {
    try {
        await requirePermission('inventory.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const {
        name, sku, price, category, initialStock, description, long_description,
        variations_raw, variation_prices, variation_sale_prices, variant_stocks, price_cost, price_sale, weight_g,
        specifications, whats_included, features, gallery, videoUrl
    } = data;
    const { v4: uuidv4 } = await import('uuid');

    const productId = uuidv4();

    // Parse variations string "Color=Red,Blue; Size=S,M" -> { "Color": ["Red", "Blue"], "Size": ["S", "M"] }
    let variations = {};
    if (variations_raw && typeof variations_raw === 'string') {
        try {
            variations = variations_raw.split(';').reduce((acc: any, part) => {
                const [key, values] = part.split('=').map(s => s.trim());
                if (key && values) {
                    acc[key] = values.split(',').map(v => v.trim());
                }
                return acc;
            }, {});
        } catch (e) {
            console.error("Failed to parse variations:", e);
        }
    }

    const galleryArray = Array.isArray(gallery) ? gallery : [];
    const mainImage = galleryArray.length > 0 ? galleryArray[0] : null;

    // Get category slug
    const categorySlug = await getCategorySlug(category);

    try {
        // 1. Create Product
        await query(`
            INSERT INTO products (
                id, sku, name, category_path, price_retail, price_cost, price_sale, tax_code, 
                description, long_description, variations, variation_prices, variation_sale_prices, specifications, whats_included, features, gallery, video_url, image, weight_g,
                is_active
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, 'VAT_18', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            productId, sku, name, categorySlug || category, price,
            price_cost || 0,
            price_sale || 0,
            description || '',
            long_description || '',
            JSON.stringify(variations),
            variation_prices ? JSON.stringify(variation_prices) : JSON.stringify({}),
            variation_sale_prices ? JSON.stringify(variation_sale_prices) : JSON.stringify({}),
            specifications || JSON.stringify({}),
            whats_included || JSON.stringify([]),
            features || JSON.stringify([]),
            JSON.stringify(galleryArray),
            videoUrl || null,
            mainImage,
            Number(weight_g) || 0,
            data.is_active !== undefined ? data.is_active : true
        ]);

        // 2. Initial Stock (if > 0)
        const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[]; // Default location
        if (loc) {
            if (Number(initialStock) > 0) {
                await query(`
                    INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                    VALUES (?, ?, ?, ?, 'INITIAL_STOCK', 'SETUP')
                `, [uuidv4(), productId, loc.id, initialStock]);
            }
            if (variant_stocks && typeof variant_stocks === 'object') {
                for (const [variantId, stock] of Object.entries(variant_stocks)) {
                    if (Number(stock) > 0) {
                        await query(`
                            INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc, variant_id)
                            VALUES (?, ?, ?, ?, 'INITIAL_STOCK', 'SETUP', ?)
                        `, [uuidv4(), productId, loc.id, stock, variantId]);
                    }
                }
            }
        }

        // Revalidate storefront and admin paths
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop'); // Update store too

        return { success: true };
    } catch (e: any) {
        console.error("Create Product Error:", e);
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'SKU already exists' };
        }
        return { error: 'Failed to create product' };
    }
}

export async function adjustStock(productId: string, delta: number, reason: string, variantId?: string) {
    try {
        await requirePermission('inventory.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const { v4: uuidv4 } = await import('uuid');
    try {
        let [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];

        // Auto-create location if missing (Fix for empty locations table)
        if (!loc) {
            const locId = uuidv4();
            await query("INSERT INTO locations (id, name, address) VALUES (?, ?, ?)", [locId, 'Main Store', 'Default Address']);
            loc = { id: locId };
        }

        const locId = loc.id;

        await query(`
            INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc, variant_id)
            VALUES (?, ?, ?, ?, ?, 'ADMIN_ADJ', ?)
        `, [uuidv4(), productId, loc.id, delta, reason, variantId || null]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');

        return { success: true };
    } catch (e: any) {
        console.error("Stock Adjust Error:", e);
        return { error: 'Failed to adjust stock' };
    }
}

export async function getVariantStock(productId: string) {
    try {
        console.log(`[getVariantStock] Fetching for ${productId}`);
        // Just return map of variant_id -> sum(delta)
        // variant_id can be null (for main product stock if mixed) or a string
        const rows = await query(`
            SELECT variant_id, SUM(delta) as stock
            FROM inventory_ledger
            WHERE product_id = ? AND variant_id IS NOT NULL
            GROUP BY variant_id
        `, [productId]) as any[];

        console.log(`[getVariantStock] Rows:`, rows);

        const stockMap: Record<string, number> = {};
        rows.forEach(r => {
            stockMap[r.variant_id] = Number(r.stock);
        });
        return stockMap;
    } catch (e) {
        console.error("Failed to get variant stock:", e);
        return {};
    }
}

export async function deleteProduct(productId: string) {
    try {
        await requirePermission('inventory.manage');
    } catch (e) {
        return { success: false, error: 'Unauthorized' };
    }

    try {
        // Check for sales history
        const [salesCheck] = await query(`
            SELECT COUNT(*) as count FROM sales_items WHERE product_id = ?
        `, [productId]) as any[];

        if (salesCheck.count > 0) {
            return { success: false, error: 'Cannot delete product with existing sales history. Set stock to 0 or archive it instead (Archiving not yet implemented).' };
        }

        // Fetch product to get images before deletion
        const [product] = await query(`SELECT image, gallery FROM products WHERE id = ?`, [productId]) as any[];

        if (product) {
            const { deleteUploadedFile, deleteUploadedFiles } = await import('@/lib/file-storage');
            await deleteUploadedFile(product.image);
            if (product.gallery) {
                const gallery = typeof product.gallery === 'string' ? JSON.parse(product.gallery) : product.gallery;
                if (Array.isArray(gallery)) {
                    await deleteUploadedFiles(gallery);
                }
            }
        }

        // Delete inventory ledger entries
        await query(`
            DELETE FROM inventory_ledger WHERE product_id = ?
        `, [productId]);

        // Delete the product
        await query(`
            DELETE FROM products WHERE id = ?
        `, [productId]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop');

        return { success: true };
    } catch (e: any) {
        console.error("Delete Product Error:", e);
        return { success: false, error: e.message || 'Failed to delete product' };
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        await requirePermission('inventory.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    const {
        name, sku, price, category, description, long_description,
        variations_raw, variation_prices, variation_sale_prices, price_cost, price_sale, weight_g,
        specifications, whats_included, features, gallery, videoUrl
    } = data;

    // Parse variations string "Color=Red,Blue; Size=S,M" -> { "Color": ["Red", "Blue"], "Size": ["S", "M"] }
    let variations = {};
    if (variations_raw && typeof variations_raw === 'string') {
        try {
            variations = variations_raw.split(';').reduce((acc: any, part) => {
                const [key, values] = part.split('=').map(s => s.trim());
                if (key && values) {
                    acc[key] = values.split(',').map(v => v.trim());
                }
                return acc;
            }, {});
        } catch (e) {
            console.error("Failed to parse variations:", e);
        }
    }

    const galleryArray = Array.isArray(gallery) ? gallery : [];
    const mainImage = galleryArray.length > 0 ? galleryArray[0] : null;

    // Get category slug
    const categorySlug = await getCategorySlug(category);

    try {
        // Fetch current product to find removed images
        const [oldProduct] = await query(`SELECT image, gallery FROM products WHERE id = ?`, [id]) as any[];

        await query(`
            UPDATE products SET
                sku = ?, name = ?, category_path = ?, price_retail = ?, price_cost = ?, price_sale = ?, 
                description = ?, long_description = ?, variations = ?, variation_prices = ?, variation_sale_prices = ?, weight_g = ?,
                specifications = ?, whats_included = ?, features = ?, gallery = ?, video_url = ?, image = ?, is_active = ?
            WHERE id = ?
        `, [
            sku, name, categorySlug || category, price,
            price_cost || 0,
            price_sale || 0,
            description || '',
            long_description || '',
            JSON.stringify(variations),
            variation_prices ? JSON.stringify(variation_prices) : JSON.stringify({}),
            variation_sale_prices ? JSON.stringify(variation_sale_prices) : JSON.stringify({}),
            Number(weight_g) || 0,
            specifications || JSON.stringify({}),
            whats_included || JSON.stringify([]),
            features || JSON.stringify([]),
            JSON.stringify(galleryArray),
            videoUrl || null,
            mainImage,
            data.is_active !== undefined ? data.is_active : true,
            id
        ]);

        // Post-update cleanup: find images that were removed
        if (oldProduct) {
            const { deleteUploadedFile } = await import('@/lib/file-storage');

            // Check main image
            if (oldProduct.image && oldProduct.image !== mainImage) {
                await deleteUploadedFile(oldProduct.image);
            }

            // Check gallery
            const oldGallery = typeof oldProduct.gallery === 'string' ? JSON.parse(oldProduct.gallery) : (oldProduct.gallery || []);
            if (Array.isArray(oldGallery)) {
                const removedFromGallery = oldGallery.filter(img => !galleryArray.includes(img));
                for (const img of removedFromGallery) {
                    await deleteUploadedFile(img);
                }
            }
        }

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop');

        return { success: true };
    } catch (e: any) {
        console.error("Update Product Error:", e);
        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'SKU already exists' };
        }
        return { error: 'Failed to update product' };
    }
}

export async function toggleProductStatus(id: string, isActive: boolean) {
    try {
        await requirePermission('inventory.manage');
        await query('UPDATE products SET is_active = ? WHERE id = ?', [isActive, id]);

        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/inventory');
        revalidatePath('/shop');

        return { success: true };
    } catch (e: any) {
        console.error("Toggle Status Error:", e);
        return { success: false, error: e.message };
    }
}
