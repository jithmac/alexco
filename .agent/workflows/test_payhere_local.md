---
description: How to test PayHere integration locally using Ngrok
---

# Testing PayHere Locally with Ngrok

PayHere requires a **publicly accessible URL** to send payment notifications (Webhooks). Since `localhost` is not public, we use **Ngrok** to create a secure tunnel.

## Step 1: Install & Run Ngrok

1.  **Download Ngrok**: Go to [ngrok.com/download](https://ngrok.com/download) and download the version for Windows.
2.  **Unzip**: Extract the downloaded file.
3.  **Run Ngrok**:
    - Open your terminal (Command Prompt or PowerShell).
    - Navigate to the folder where you unzipped `ngrok.exe`.
    - Run the following command (assuming your app runs on port 3000):
      ```bash
      ngrok http 3000
      ```
4.  **Copy URL**: Ngrok will generate a Forwarding URL, looking like `https://a1b2-c3d4.ngrok-free.app`. **Copy this URL.**

## Step 2: Update Configuration

1.  Open your project in VS Code.
2.  Open `.env.local`.
3.  Find `NEXT_PUBLIC_BASE_URL`.
4.  Paste your Ngrok URL:
    ```env
    NEXT_PUBLIC_BASE_URL="https://a1b2-c3d4.ngrok-free.app"
    ```
    *(Make sure there is no trailing slash `/`)*

## Step 3: Test Payment

1.  **Restart Server**: Stop your Next.js server (`Ctrl+C`) and start it again (`npm run dev`) to load the new env var.
2.  **Go to Checkout**: Open your browser and go to `http://localhost:3000` (or your ngrok URL). Add items to cart and proceed to checkout.
3.  **Place Order**: Select "PayHere" and click "Place Order".
4.  **Pay**:
    - The PayHere Sandbox popup should appear.
    - Use the Sandbox Test Cards provided in PayHere documentation (or just click "Docs" in the popup to find them).
    - Complete the payment.
5.  **Verify**:
    - Check your terminal: You should see "Order [ID] marked as PAID".
    - Check the **Admin Panel > Online Orders**. The order should be marked as **Processing** (or Paid).

## Important Note

- **Ngrok URL Changes**: Every time you restart ngrok, the URL changes. You must update `.env.local` and restart your Next.js server each time.
- **Production**: When deploying to Hostinger/VPS, set `NEXT_PUBLIC_BASE_URL` to your actual domain (e.g., `https://alexco.lk`).
