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

log('--- SERVER STARTING ---');
log(`Node Version: ${process.version}`);
log(`Directory: ${__dirname}`);

// Diagnostic: Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
    log('.env file found. Loading variables...');
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) return;
        
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
            const value = valueParts.join('=').split('#')[0].trim().replace(/^["']|["']$/g, '');
            process.env[key.trim()] = value;
        }
    });
} else {
    log('WARNING: .env file NOT found. Database connections may fail.');
}

// Diagnostic: Check database variables (masked)
log(`DB_HOST: ${process.env.DB_HOST ? 'Set' : 'NOT Set'}`);
log(`DB_USER: ${process.env.DB_USER ? 'Set' : 'NOT Set'}`);

// Hostinger passes the port via process.env.PORT
const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';

// Check for standalone build (Next.js 12+ optimization)
const standalonePath = path.join(__dirname, '.next', 'standalone', 'server.js');

if (fs.existsSync(standalonePath)) {
    log('Using standalone build server...');
    process.env.PORT = port;
    process.env.HOSTNAME = hostname;
    require(standalonePath);
} else {
    log('Standalone build not found. Falling back to standard Next.js handler.');
    log('Make sure "npm run build" has been executed.');

    try {
        const next = require('next');
        const dev = process.env.NODE_ENV !== 'production';
        const app = next({ dev });
        const handle = app.getRequestHandler();

        app.prepare().then(() => {
            log('App prepared, listening on port ' + port);
            createServer(async (req, res) => {
                try {
                    const parsedUrl = parse(req.url, true);
                    await handle(req, res, parsedUrl);
                } catch (err) {
                    log(`ERROR handling request ${req.url}: ${err.message}`);
                    res.statusCode = 500;
                    res.end('Internal Server Error');
                }
            }).listen(port, hostname, (err) => {
                if (err) {
                    log(`CRITICAL ERROR: Failed to listen on port ${port}: ${err.message}`);
                    process.exit(1);
                }
                log(`>>> SERVER READY AT http://${hostname}:${port}`);
            });
        }).catch(err => {
            log(`CRITICAL ERROR during app.prepare: ${err.message}`);
            log(err.stack);
            process.exit(1);
        });
    } catch (err) {
        log(`CRITICAL ERROR: "next" module not found: ${err.message}`);
        log('Verify that node_modules are installed and "server.js" is in the root directory.');
        process.exit(1);
    }
}
