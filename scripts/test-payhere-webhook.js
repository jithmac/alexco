const crypto = require('crypto');

async function testWebhook() {
    const merchantId = "241232";
    const merchantSecret = "MjczOTc3MjA5MzM2NzIxODQyOTMyMjg0ODE0MTkyNDkzNjUzOTcw";
    const orderId = "ONL-123456";
    const amount = "100.00";
    const currency = "LKR";
    const statusCode = "2";

    const hashedSecret = crypto.createHash('md5')
        .update(merchantSecret)
        .digest('hex')
        .toUpperCase();

    const md5sig = crypto.createHash('md5')
        .update(merchantId + orderId + amount + currency + statusCode + hashedSecret)
        .digest('hex')
        .toUpperCase();

    console.log("Sending Webhook with md5sig:", md5sig);

    try {
        const response = await fetch('http://localhost:3003/api/payhere/notify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                merchant_id: merchantId,
                order_id: orderId,
                payhere_amount: amount,
                payhere_currency: currency,
                status_code: statusCode,
                md5sig: md5sig
            })
        });

        const text = await response.text();
        console.log("Response Status:", response.status);
        console.log("Response Text:", text);
    } catch (e) {
        console.error("Error connecting to localhost:3003", e.message);
    }
}

testWebhook();
