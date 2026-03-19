"use server";

import crypto from "crypto";

export async function generatePayHereHash(orderId: string, amount: number, currency: string) {
    const merchantId = process.env.PAYHERE_MERCHANT_ID!.trim();
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!.trim();

    if (!merchantId || !merchantSecret) {
        throw new Error("PayHere credentials not configured");
    }

    // 1. Format amount to 2 decimal places (Use toFixed for consistency)
    const amountFormatted = amount.toFixed(2);

    // 2. Hash the secret
    const hashedSecret = crypto.createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    // 3. Generate the final hash
    const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;

    console.log("PayHere Debug:", {
        merchantId,
        orderId,
        amountFormatted,
        currency,
        secretLength: merchantSecret.length,
        hashStringPreEncrypt: hashString
    });

    const hash = crypto.createHash('md5')
        .update(hashString)
        .digest('hex')
        .toUpperCase();

    return { hash, merchantId, amountFormatted };
}
