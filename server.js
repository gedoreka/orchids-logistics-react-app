const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Hostinger sometimes passes PORT, sometimes we use a default
const port = process.env.PORT || 3000;
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

log(`--- SERVER STARTING ---`);
log(`Node Version: ${process.version}`);
log(`Mode: ${dev ? 'development' : 'production'}`);
log(`Port: ${port}`);

app.prepare()
  .then(() => {
    log('App prepared, creating server...');
    const server = createServer((req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
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
      log(`>>> SERVER READY at http://${hostname}:${port}`);
    });

    server.on('error', (err) => {
      log(`SERVER ERROR: ${err.message}`);
    });
  })
  .catch(err => {
    log(`CRITICAL ERROR during startup: ${err.message}`);
    log(err.stack);
    process.exit(1);
  });
