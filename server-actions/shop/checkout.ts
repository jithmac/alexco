"use server";

import { query } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import { writeFile } from "fs/promises";
import path from "path";
import { mkdir } from "fs/promises";

export async function createOnlineOrder(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const address = formData.get("address") as string;
        const paymentMethod = formData.get("paymentMethod") as string;
        const deliveryMethod = (formData.get("deliveryMethod") as string) || "delivery";
        const itemsStr = formData.get("items") as string;
        const total = parseFloat(formData.get("total") as string);
        const receiptFile = formData.get("receipt") as File | null;

        const items = JSON.parse(itemsStr);
        const orderId = uuidv4();
        const orderNumber = `ONL-${Date.now().toString().slice(-6)}`;
        let paymentProofUrl = null;

        // 1. Handle File Upload (If Bank Transfer)
        if (receiptFile && paymentMethod === 'bank_transfer') {
            const bytes = await receiptFile.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create uploads directory if not exists
            const uploadDir = path.join(process.cwd(), "public/uploads/receipts");
            await mkdir(uploadDir, { recursive: true });

            // Generate unique filename
            const filename = `${orderId}-${receiptFile.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
            const filepath = path.join(uploadDir, filename);

            await writeFile(filepath, buffer);
            paymentProofUrl = `/uploads/receipts/${filename}`;
        }

        // 2. Get Default Location (for inventory sync)
        const [loc] = await query("SELECT id FROM locations LIMIT 1") as any[];
        const locationId = loc ? loc.id : null;
        if (!locationId) throw new Error("Store location not found");

        // 2.5 STOCK VALIDATION - Check if all items have sufficient stock
        for (const item of items) {
            const productId = item.productId || item.id;
            const requestedQty = item.quantity;

            // Calculate current stock from inventory_ledger
            const [stockResult] = await query(`
                SELECT COALESCE(SUM(delta), 0) as current_stock
                FROM inventory_ledger
                WHERE product_id = ? AND location_id = ?
            `, [productId, locationId]) as any[];

            const currentStock = Number(stockResult?.current_stock) || 0;

            if (currentStock < requestedQty) {
                return {
                    success: false,
                    error: `Insufficient stock for "${item.name}". Available: ${currentStock}, Requested: ${requestedQty}`
                };
            }
        }

        // Set delivery status based on delivery method
        const deliveryStatus = deliveryMethod === 'pickup' ? 'PICKUP' : 'PENDING';

        // 3. Insert Order
        await query(`
            INSERT INTO sales_orders (
                id, order_number, total_amount, status, payment_method, delivery_method, location_id, sync_status,
                customer_name, customer_phone, customer_email, shipping_address, order_source, delivery_status, payment_proof, created_at
            )
            VALUES (?, ?, ?, 'PENDING', ?, ?, ?, 'SYNCED', ?, ?, ?, ?, 'ONLINE', ?, ?, NOW())
        `, [
            orderId, orderNumber, total, paymentMethod, deliveryMethod, locationId,
            name, phone, email, address, deliveryStatus, paymentProofUrl
        ]);

        // 4. Insert Items
        for (const item of items) {
            const lineTotal = item.price * item.quantity;
            const { v4: uuidv4 } = await import("uuid");

            // Prepare variations JSON
            const variationsJson = (item.variations && Object.keys(item.variations).length > 0)
                ? JSON.stringify(item.variations)
                : null;

            await query(`
                INSERT INTO sales_items (id, order_id, product_id, quantity, unit_price, line_total, variant_options)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [uuidv4(), orderId, item.productId || item.id, item.quantity, item.price, lineTotal, variationsJson]);

            // Deduct Inventory
            await query(`
                INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                VALUES (?, ?, ?, ?, 'SALE_ONLINE', ?)
            `, [uuidv4(), item.productId || item.id, locationId, -item.quantity, orderNumber]);
        }

        // 5. Revalidate
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/paths/admin/orders');
        revalidatePath('/admin/inventory');

        return { success: true, orderNumber };

    } catch (err: any) {
        console.error("Create Online Order Error:", err);
        return { success: false, error: "Failed to place order. " + err.message };
    }
}
