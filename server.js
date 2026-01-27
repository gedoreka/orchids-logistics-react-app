const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const port = process.env.PORT || 3000;

// Simple logging to a file in the root to help debug Hostinger issues
const logFile = path.join(__dirname, 'server.log');
function log(msg) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    fs.appendFileSync(logFile, logMsg);
    console.log(logMsg);
}

log(`Starting server in ${dev ? 'development' : 'production'} mode...`);
log(`Port assigned: ${port}`);

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, (err) => {
    if (err) {
        log('CRITICAL ERROR listening on port: ' + err.message);
        throw err;
    }
    log(`> Server is ready and listening on port ${port}`);
  });
}).catch(err => {
    log('CRITICAL ERROR during app.prepare(): ' + err.message);
    log(err.stack);
    process.exit(1);
});
