import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const contentType = req.headers.get("content-type") || "";

        let data: any = {};

        if (contentType.includes("application/x-www-form-urlencoded")) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                data[key] = value;
            });
        } else if (contentType.includes("application/json")) {
            data = await req.json();
        } else {
            return new NextResponse("Unsupported Content-Type", { status: 400 });
        }

        const {
            merchant_id,
            order_id,
            payhere_amount,
            payhere_currency,
            status_code,
            md5sig
        } = data;

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET?.trim() || "";
        const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim() || "";

        console.log("\n--- PayHere Webhook Received ---");
        console.log("Raw Data:", JSON.stringify(data, null, 2));

        // 1. Validate Merchant ID
        if (merchant_id !== merchantId) {
            console.error("Invalid Merchant ID");
            return new NextResponse("Invalid Merchant ID", { status: 400 });
        }

        // 2. Generate Local Hash
        // md5sig = strtoupper(md5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + strtoupper(md5(merchant_secret))))
        const hashedSecret = crypto.createHash('md5')
            .update(merchantSecret)
            .digest('hex')
            .toUpperCase();

        const localMd5Sig = crypto.createHash('md5')
            .update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + hashedSecret)
            .digest('hex')
            .toUpperCase();

        console.log("Hash Verification:", {
            expected: md5sig,
            generated: localMd5Sig,
            match: localMd5Sig === md5sig,
            statusCode: status_code,
            orderId: order_id,
        });

        // 3. Verify Hash
        if (localMd5Sig !== md5sig) {
            console.error("Hash Mismatch");
            return new NextResponse("Hash Mismatch", { status: 400 });
        }

        // 4. Handle Payment Result
        if (status_code === "2") {
            // ✅ SUCCESS — Confirm order, deduct stock, mark as paid
            const [order] = await query(`
                SELECT id, location_id, order_number FROM sales_orders WHERE order_number = ?
            `, [order_id]) as any[];

            if (!order) {
                console.error(`Order not found: ${order_id}`);
                return new NextResponse("Order not found", { status: 404 });
            }

            // Update order status
            await query(`
                UPDATE sales_orders 
                SET status = 'PROCESSING', 
                    payment_status = 'PAID', 
                    delivery_status = 'CONFIRMED',
                    updated_at = NOW() 
                WHERE order_number = ?
            `, [order_id]);

            // Deduct inventory for all items in the order
            const items = await query(`
                SELECT product_id, quantity FROM sales_items WHERE order_id = ?
            `, [order.id]) as any[];

            const { v4: uuidv4 } = await import("uuid");
            for (const item of items) {
                await query(`
                    INSERT INTO inventory_ledger (transaction_id, product_id, location_id, delta, reason_code, reference_doc)
                    VALUES (?, ?, ?, ?, 'SALE_ONLINE', ?)
                `, [uuidv4(), item.product_id, order.location_id, -item.quantity, order.order_number]);
            }

            console.log(`✅ Order ${order_id} confirmed and stock deducted.`);

        } else if (status_code === "0") {
            // ⏳ PENDING — PayHere is processing, do nothing yet
            console.log(`⏳ Order ${order_id} payment is PENDING. Waiting for final status.`);

        } else {
            // ❌ FAILED / CANCELLED — Do nothing, leave order as AWAITING_PAYMENT (invisible in admin)
            console.log(`❌ Order ${order_id} payment failed/cancelled (status_code=${status_code}). No DB update.`);
        }

        // Always return 200 to PayHere so it doesn't retry
        return new NextResponse("OK", { status: 200 });

    } catch (e) {
        console.error("PayHere Webhook Error:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
