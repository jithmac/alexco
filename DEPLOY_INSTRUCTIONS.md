# 🚀 Correct Hostinger Deployment Guide (Node.js SSR)

**Status:** ✅ Working
**Last Updated:** 2026-02-11

The critical difference for your Next.js app on Hostinger is that it **MUST** be deployed as a **Node.js Application** (SSR), not a Static Site.

## 1. Hostinger Panel Configuration
*   **Project Type:** **Node.js** (Do NOT use "Deployments" or "Static").
*   **Application Root:** `public_html` (or your domain folder).
*   **Startup File:** `node_modules/next/dist/bin/next` (Preferred) OR `package.json`.
*   **Run Command:** `npm start`

## 2. `package.json` Requirements (CRITICAL)
Hostinger requires your app to listen on a specific port assigned by their system (`$PORT`).
Your `package.json` **MUST** have these exact scripts:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start -p $PORT"
}
```
*   **Why?** The `-p $PORT` part tells Next.js to use the port Hostinger gives it (e.g., 63452) instead of hardcoding 3000. without this -> **503 Error**.

## 3. Environment Variables
Since we are using standard deployment now, you must set variables in the **Hostinger Panel** -> **Environment Variables** section:
*   `DATABASE_URL`: `mysql://...`
*   `JWT_SECRET`: `...`
*   `NEXT_PUBLIC_APP_URL`: `https://...`
*   `NODE_ENV`: `production`

## 4. Deployment Process (Standard)
1.  **Upload Source Code**: Upload `package.json`, `next.config.ts`, `app/`, `public/`, `components/`, `lib/`, etc.
    *   *Do NOT upload `node_modules` or `.next` (Hostinger builds these).*
2.  **Go to Hostinger Panel**.
3.  **Click "Build"** (Runs `npm install` + `npm run build`).
4.  **Click "Restart"**.

## vs. "Normal" Deployment
| Feature | Normal VPS / Local | Hostinger Managed Node.js |
| :--- | :--- | :--- |
| **Port** | `3000` (Fixed) | `process.env.PORT` (Dynamic - changes every restart) |
| **Start Command** | `next start` | `next start -p $PORT` (Must accept port flag) |
| **SSL/Nginx** | You configure manually | Handled automatically by Hostinger |
| **Process Manager**| PM2 (Manual) | Passenger / Litespeed (Automatic) |

## Cleanup
You can now safely delete the diagnostic files we created:
*   `server.js`
*   `app.js` (The diagnostic one)
*   `diagnostic.js`
*   `scripts/deploy-env-check.js`
*   `debug.log`
