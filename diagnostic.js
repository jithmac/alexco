const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });

    let log = [];
    const addLog = (msg) => log.push(`<div>${msg}</div>`);
    const addSection = (title) => log.push(`<h2>${title}</h2>`);

    addSection('🔍 Diagnostic Report');
    addLog(`<b>Time:</b> ${new Date().toISOString()}`);
    addLog(`<b>Node Version:</b> ${process.version}`);
    addLog(`<b>Platform:</b> ${process.platform} (${process.arch})`);
    addLog(`<b>Current Directory:</b> ${process.cwd()}`);
    addLog(`<b>Listening Port:</b> ${PORT}`);

    addSection('📂 File System Check');
    const filesToCheck = ['.env', 'server.env', 'package.json', '.next', 'node_modules'];
    filesToCheck.forEach(f => {
        const p = path.join(process.cwd(), f);
        const exists = fs.existsSync(p);
        addLog(`${exists ? '✅' : '❌'} <b>${f}:</b> ${exists ? 'Found' : 'Missing'}`);
    });

    addSection('🌍 Environment Variables');
    addLog(`<b>NODE_ENV:</b> ${process.env.NODE_ENV}`);
    if (process.env.DATABASE_URL) {
        addLog(`✅ <b>DATABASE_URL:</b> Found (Length: ${process.env.DATABASE_URL.length})`);
    } else {
        addLog(`❌ <b>DATABASE_URL:</b> Missing`);
    }

    // Attempt to read .env content (safe print)
    if (fs.existsSync(path.join(process.cwd(), '.env'))) {
        try {
            const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf8');
            const hasDbUrlInFile = envContent.includes('DATABASE_URL=');
            addLog(`📄 <b>.env file content check:</b> ${hasDbUrlInFile ? 'Contains DATABASE_URL' : 'Does NOT contain DATABASE_URL'}`);
        } catch (e) {
            addLog(`❌ Error reading .env: ${e.message}`);
        }
    }

    addSection('📦 Dependency Check');
    try {
        require('mysql2');
        addLog('✅ <b>mysql2:</b> Loaded successfully');
    } catch (e) {
        addLog(`❌ <b>mysql2:</b> Failed to load (${e.message})`);
    }

    res.end(`
        <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 20px; line-height: 1.5; background: #f0f0f0; }
                div { margin-bottom: 5px; }
                h2 { border-bottom: 2px solid #ccc; padding-bottom: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            ${log.join('')}
        </body>
        </html>
    `);
});

server.listen(PORT, () => {
    console.log(`Diagnostic server running on port ${PORT}`);
});
