const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Hostinger passes the port via process.env.PORT
const port = process.env.PORT || 3000;
// Using 0.0.0.0 to listen on all interfaces, common for proxy setups
const hostname = '0.0.0.0';

const logFile = path.join(__dirname, 'server.log');
function log(msg) {
    const timestamp = new Date().toISOString();
    const logMsg = `[${timestamp}] ${msg}\n`;
    try {
        fs.appendFileSync(logFile, logMsg);
    } catch (e) {}
    console.log(logMsg);
}

log('--- SERVER INITIALIZING ---');
log(`Node Version: ${process.version}`);
log(`Directory: ${__dirname}`);
log(`Port: ${port}`);
log(`Env: ${process.env.NODE_ENV}`);

// Check for .next folder in production
if (!dev && !fs.existsSync(path.join(__dirname, '.next'))) {
    log('CRITICAL ERROR: .next folder not found! You must run "npm run build" first.');
}

app.prepare()
  .then(() => {
    log('App prepared successfully');
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
  })
  .catch(err => {
    log(`CRITICAL ERROR during startup: ${err.message}`);
    log(err.stack);
    setTimeout(() => process.exit(1), 1000);
  });
