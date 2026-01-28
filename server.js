const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const path = require('path');

// Logging utility
const logFile = path.join(__dirname, 'server.log');
function log(msg) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(logFile, logMsg);
    } catch (e) {}
    console.log(logMsg);
}

log('--- HOSTINGER NODE.JS STARTUP ---');
log(`Node Version: ${process.version}`);
log(`Directory: ${__dirname}`);
log(`Port Env: ${process.env.PORT}`);

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

// Check if we should use the standalone server (recommended for Hostinger)
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standalonePath)) {
    log('Detected standalone build. Using .next/standalone/server.js');
    // Note: standalone server.js usually expects to be in the standalone root
    // and might need some env variables.
    try {
        process.env.PORT = port;
        process.env.HOSTNAME = hostname;
        require(standalonePath);
    } catch (err) {
        log(`CRITICAL ERROR running standalone server: ${err.message}`);
        log(err.stack);
        process.exit(1);
    }
} else {
    log('Standalone build NOT found. Falling back to standard Next.js server.');
    log('Make sure "node_modules" are installed and "npm run build" has been executed.');
    
    try {
        const next = require('next');
        const dev = process.env.NODE_ENV !== 'production';
        const app = next({ dev });
        const handle = app.getRequestHandler();

        app.prepare().then(() => {
            log('Standard app prepared successfully');
            const server = createServer(async (req, res) => {
                try {
                    const parsedUrl = parse(req.url, true);
                    await handle(req, res, parsedUrl);
                } catch (err) {
                    log(`ERROR handling request ${req.url}: ${err.message}`);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            });

            server.listen(port, hostname, (err) => {
                if (err) {
                    log(`CRITICAL ERROR: Failed to listen on port ${port}: ${err.message}`);
                    process.exit(1);
                }
                log(`>>> SERVER RUNNING at http://${hostname}:${port}`);
            });

            server.on('error', (err) => {
                log(`SERVER ERROR: ${err.message}`);
            });
        }).catch(err => {
            log(`CRITICAL ERROR during app.prepare: ${err.message}`);
            log(err.stack);
            process.exit(1);
        });
    } catch (err) {
        log(`CRITICAL ERROR: "next" module not found or failed to load: ${err.message}`);
        log('Please run "npm install" on the server.');
        process.exit(1);
    }
}
