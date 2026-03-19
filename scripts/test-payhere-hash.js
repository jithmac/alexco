require('dotenv').config({ path: '.env.local' });
const crypto = require('crypto');

// Values from user debug log
const merchantId = "241232";
const orderId = "ONL-862023";
const amount = 1350.00;
const currency = "LKR";
const secret = process.env.PAYHERE_MERCHANT_SECRET.trim();

console.log("Secret used:", secret);
console.log("Secret Length:", secret.length);

const amountFormatted = amount.toFixed(2);
console.log("Amount Formatted:", amountFormatted);

const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
console.log("Hashed Secret:", hashedSecret);

const hashString = merchantId + orderId + amountFormatted + currency + hashedSecret;
console.log("Pre-Hash String:", hashString);

const finalHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
console.log("Final Hash:", finalHash);
