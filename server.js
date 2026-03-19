const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, 'debug.log');

// Helper to write to log file
function logToFile(msg) {
    const timestamp = new Date().toISOString();
    const line = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(LOG_FILE, line);
    } catch (e) {
        // failed to write log
    }
}

// Initial Log
logToFile('--- SERVER.JS STARTING ---');
logToFile(`Node: ${process.version}`);
logToFile(`Env PORT: ${process.env.PORT}`);

const PORT = process.env.PORT || 3000;

try {
    const server = http.createServer((req, res) => {
        logToFile(`Request: ${req.method} ${req.url}`);

        res.writeHead(200, { 'Content-Type': 'text/html' });

        let logContent = 'No logs yet.';
        try {
            if (fs.existsSync(LOG_FILE)) {
                logContent = fs.readFileSync(LOG_FILE, 'utf8');
            }
        } catch (e) {
            logContent = `Error reading log: ${e.message}`;
        }

        res.end(`
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Diagnostic Server</title>
                <style>
                    body { font-family: monospace; padding: 20px; background: #333; color: #0f0; }
                    h1 { border-bottom: 1px solid #555; padding-bottom: 10px; }
                    .log-box { background: #000; padding: 15px; border: 1px solid #555; white-space: pre-wrap; word-break: break-all; }
                </style>
            </head>
            <body>
                <h1>✅ SERVER IS RUNNING (server.js)</h1>
                <p>Hostinger recognized server.js!</p>
                
                <h2>Environment Variables Check</h2>
                <ul>
                    <li>NODE_ENV: ${process.env.NODE_ENV}</li>
                    <li>DATABASE_URL: ${process.env.DATABASE_URL ? '✅ FOUND' : '❌ MISSING'}</li>
                </ul>

                <h2>Debug Log</h2>
                <div class="log-box">${logContent}</div>
                
                <p>Generated at: ${new Date().toISOString()}</p>
            </body>
            </html>
        `);
    });

    server.listen(PORT, () => {
        logToFile(`Server listening on port ${PORT}`);
        console.log(`Server listening on port ${PORT}`);
    });
} catch (err) {
    logToFile(`CRITICAL ERROR: ${err.message}`);
}
