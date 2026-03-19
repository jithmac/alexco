#!/bin/bash

# Enhanced Cleaner Deployment Script for Hostinger

echo "🚀 Starting Clean Deployment Process..."

# 0. Environment Setup & Validation
echo "🔍 Checking environment configuration..."

if [ -f "server.env" ]; then
    echo "✅ Found 'server.env'. Copying to '.env'..."
    cp server.env .env
elif [ -f ".env" ]; then
    echo "ℹ️ Found existing '.env'. Using it."
else
    echo "❌ CRITICAL ERROR: No 'server.env' or '.env' found!"
    echo "   Please upload 'server.env' to the root directory before deploying."
    exit 1
fi

# Verify DATABASE_URL is present
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ CRITICAL ERROR: DATABASE_URL is missing in .env!"
    echo "   The application will invoke 503 errors without a database connection."
    exit 1
fi

echo "✅ Environment configuration verified."

# 1. Stop Node Process (optional, but good if you can)
# pkill -f node || true 

# 2. Backup Logic (optional)
# cp .env .env.bak || true

# 3. Clean Setup
echo "🧹 Removing old build artifacts..."
rm -rf .next
rm -rf node_modules
# rm -rf package-lock.json # Only if you want to regenerate lock file, but safer to keep it consistent if possible. 
# For now, let's keep package-lock if it exists, but remove node_modules to force fresh install.

# 4. Install Dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error: npm install failed!"
    exit 1
fi

# 5. Build Application
echo "🏗️ Building application..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error: npm run build failed!"
    exit 1
fi

echo "✅ Build successful!"
echo "👉 Now please RESTART your application in the Hostinger Panel."
exit 0
