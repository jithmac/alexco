"use server";

import { query } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getPageContent(slug: string) {
    try {
        const rows = await query(`SELECT content FROM static_pages WHERE slug = ?`, [slug]) as any[];
        return rows[0] || null;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export async function savePageContent(slug: string, title: string, content: string) {
    try {
        await query(`
            INSERT INTO static_pages (slug, title, content) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE content = VALUES(content), title = VALUES(title)
        `, [slug, title, content]);

        revalidatePath(`/policies/${slug}`);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, error: "Failed to save content" };
    }
}
