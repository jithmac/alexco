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

        const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
        const merchantId = process.env.PAYHERE_MERCHANT_ID!;

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

        // 3. Verify Hash
        if (localMd5Sig !== md5sig) {
            console.error("Hash Mismatch");
            return new NextResponse("Hash Mismatch", { status: 400 });
        }

        // 4. Update Database
        if (status_code === "2") {
            // Success
            await query(`
                UPDATE sales_orders 
                SET status = 'PROCESSING', payment_status = 'PAID', updated_at = NOW() 
                WHERE order_number = ?
            `, [order_id]);
            console.log(`Order ${order_id} marked as PAID`);
        } else if (status_code === "0") {
            // Pending
            console.log(`Order ${order_id} is PENDING`);
        } else {
            // Failed / Canceled
            await query(`
                UPDATE sales_orders 
                SET status = 'CANCELLED', payment_status = 'FAILED', updated_at = NOW() 
                WHERE order_number = ?
            `, [order_id]);
            console.log(`Order ${order_id} marked as FAILED`);
        }

        return new NextResponse("OK", { status: 200 });

    } catch (e) {
        console.error("PayHere Webhook Error:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
