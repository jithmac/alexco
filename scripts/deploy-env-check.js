const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const envPath = path.join(rootDir, '.env');
const serverEnvPath = path.join(rootDir, 'server.env');

console.log('🔍 [Deploy Check] Verifying environment setup...');

// 1. Check if .env exists, if not try to copy from server.env
if (!fs.existsSync(envPath)) {
    console.log('⚠️ [Deploy Check] .env file not found.');
    if (fs.existsSync(serverEnvPath)) {
        console.log('✅ [Deploy Check] Found server.env, copying to .env...');
        try {
            fs.copyFileSync(serverEnvPath, envPath);
            console.log('✅ [Deploy Check] copied server.env to .env successfully.');
        } catch (err) {
            console.error('❌ [Deploy Check] Failed to copy server.env:', err);
            // Don't exit yet, check process.env
        }
    } else {
        console.log('ℹ️ [Deploy Check] No server.env found either.');
    }
} else {
    console.log('✅ [Deploy Check] .env file exists.');
}

// 2. Validate DATABASE_URL existence
// Priority: 1. process.env (Hostinger UI) 2. .env file content
let hasDbUrl = false;

if (process.env.DATABASE_URL) {
    hasDbUrl = true;
    console.log('✅ [Deploy Check] DATABASE_URL found in system environment variables.');
} else if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (envContent.includes('DATABASE_URL=')) {
        hasDbUrl = true;
        console.log('✅ [Deploy Check] DATABASE_URL found in .env file.');
    }
}

// 3. Block build if missing
if (!hasDbUrl) {
    console.error('❌ [Deploy Check] CRITICAL ERROR: DATABASE_URL is missing!');
    console.error('   The build checks failed. Please ensure DATABASE_URL is set in Hostinger configuration or server.env is present.');
    process.exit(1);
}

console.log('🚀 [Deploy Check] Verification passed. Proceeding to build...');
