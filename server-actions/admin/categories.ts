"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";

export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string;
    parent_id: string | null;
    image: string | null;
    icon: string | null;
    is_active: boolean;
    order_index: number;
    children?: Category[]; // For hierarchy
    product_count?: number;
};

export async function getCategories(includeInactive = false): Promise<Category[]> {
    try {
        // 1. Fetch Categories
        let sql = `SELECT * FROM categories c`;
        if (!includeInactive) {
            sql += ` WHERE c.is_active = TRUE`;
        }
        sql += ` ORDER BY c.order_index ASC, c.name ASC`;
        const rows = await query(sql) as Category[];

        // 2. Fetch Product Counts (grouped by slug)
        const countRows = await query(`
            SELECT category_path, COUNT(*) as count 
            FROM products 
            GROUP BY category_path
        `) as any[];

        const productCountMap = new Map<string, number>();
        countRows.forEach(r => {
            if (r.category_path) productCountMap.set(r.category_path, Number(r.count));
        });

        // 3. Build hierarchy & Assign Counts
        const categoryMap = new Map<string, Category>();
        const rootCategories: Category[] = [];

        // First pass: map categories and assign direct product count
        rows.forEach(cat => {
            cat.children = [];
            cat.product_count = productCountMap.get(cat.slug) || 0;
            categoryMap.set(cat.id, cat);
        });

        // Second pass: link parents and children
        rows.forEach(cat => {
            if (cat.parent_id && categoryMap.has(cat.parent_id)) {
                categoryMap.get(cat.parent_id)!.children!.push(cat);
            } else {
                rootCategories.push(cat);
            }
        });

        // 4. Recursive Aggregation of Counts (Post-order traversal)
        // We need to sum up children counts into parents
        const aggregateCounts = (cat: Category): number => {
            let total = cat.product_count || 0;
            if (cat.children && cat.children.length > 0) {
                cat.children.forEach(child => {
                    total += aggregateCounts(child);
                });
            }
            cat.product_count = total;
            return total;
        };

        rootCategories.forEach(cat => aggregateCounts(cat));

        return rootCategories;
    } catch (e) {
        console.error("Get Categories Error:", e);
        return [];
    }
}

export async function getCategoryPath(categoryId: string): Promise<string> {
    try {
        const rows = await query(`
            WITH RECURSIVE category_path AS (
                SELECT id, name, slug, parent_id, 1 as level
                FROM categories
                WHERE id = ?
                UNION ALL
                SELECT c.id, c.name, c.slug, c.parent_id, cp.level + 1
                FROM categories c
                JOIN category_path cp ON c.id = cp.parent_id
            )
            SELECT id, name, slug FROM category_path ORDER BY level DESC
        `, [categoryId]) as any[];

        return rows.map(r => r.slug).join('/');
    } catch (e) {
        console.error("Get Category Path Error:", e);
        return "";
    }
}

export async function getCategorySlug(categoryId: string): Promise<string> {
    try {
        const [row] = await query("SELECT slug FROM categories WHERE id = ?", [categoryId]) as any[];
        return row ? row.slug : "";
    } catch (e) {
        console.error("Get Category Slug Error:", e);
        return "";
    }
}

export async function createCategory(name: string, parentId?: string, image?: string) {
    try {
        const user = await requirePermission('categories.manage');
        console.log(`User ${user.username} (ID: ${user.id}) is creating category: ${name}`);

        const { v4: uuidv4 } = await import('uuid');
        const id = uuidv4();

        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        // simple uniqueness check could be added here

        await query(
            "INSERT INTO categories (id, name, slug, parent_id, image) VALUES (?, ?, ?, ?, ?)",
            [id, name, slug, parentId || null, image || null]
        );

        revalidatePath('/paths/admin/categories');
        return { success: true, id };
    } catch (e: any) {
        console.error("Create Category Error Detail:", e);

        // Return more specific error for debugging
        if (e.message.includes("Forbidden") || e.message.includes("Unauthorized")) {
            return { error: `Permission Denied: ${e.message}` };
        }

        if (e.code === 'ER_DUP_ENTRY') {
            return { error: 'Slug already exists. Please use a unique slug.' };
        }

        return { error: `Failed to create category: ${e.message || 'Unknown error'}` };
    }
}

export async function updateCategory(id: string, name: string, parentId?: string, image?: string) {
    try {
        await requirePermission('categories.manage');

        let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        await query(
            "UPDATE categories SET name = ?, slug = ?, parent_id = ?, image = ? WHERE id = ?",
            [name, slug, parentId || null, image || null, id]
        );

        revalidatePath('/paths/admin/categories');
        revalidatePath('/shop');
        return { success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

export async function deleteCategory(id: string) {
    try {
        await requirePermission('categories.manage');
    } catch (e) {
        return { error: 'Unauthorized' };
    }

    try {
        // Check for subcategories
        const [subCheck] = await query(`SELECT COUNT(*) as count FROM categories WHERE parent_id = ?`, [id]) as any[];
        if (subCheck.count > 0) {
            return { error: 'Cannot delete category with subcategories. Delete them first.' };
        }

        // Check for usage in products (optional, strict check)
        // Since we store path string, strictly linking by ID isn't possible yet without schema change.
        // For now, we allow deletion but warn user in UI.

        await query(`DELETE FROM categories WHERE id = ?`, [id]);

        revalidatePath('/paths/admin/categories');
        revalidatePath('/shop');
        return { success: true };
    } catch (e) {
        console.error("Delete Category Error:", e);
        return { error: 'Failed to delete category' };
    }
}
