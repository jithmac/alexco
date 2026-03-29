"use server";

import crypto from "crypto";

export async function generatePayHereHash(orderId: string, amount: number, currency: string): Promise<
    { error: string; hash?: undefined; merchantId?: undefined; amountFormatted?: undefined } |
    { error?: undefined; hash: string; merchantId: string; amountFormatted: string }
> {
    const merchantId = process.env.PAYHERE_MERCHANT_ID?.trim();
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET?.trim();

    if (!merchantId || !merchantSecret) {
        console.error("PayHere credentials not configured. Check PAYHERE_MERCHANT_ID and PAYHERE_MERCHANT_SECRET env vars.");
        return { error: "PayHere credentials not configured on the server." };
    }

    // 1. Format amount to 2 decimal places
    const amountFormatted = amount.toFixed(2);

    // 2. Hash the secret: strtoupper(md5(merchant_secret))
    const hashedSecret = crypto.createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // 3. Generate the final hash: strtoupper(md5(merchant_id + order_id + amount + currency + hashed_secret))
    const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;

    console.log("PayHere Debug:", {
        merchantId,
        orderId,
        amountFormatted,
        currency,
        secretLength: merchantSecret.length,
    });

    const hash = crypto.createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();

    return { hash, merchantId, amountFormatted };
}
