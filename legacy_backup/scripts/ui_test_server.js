const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const START_PORT = 3001;

// Serve static files from the parent directory to allow access to /utils
app.use(express.static(path.join(__dirname, '..')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'stormcell_test.html'));
});

// Proxy endpoint for EWMRS images to bypass CORP/CORS
app.get('/proxy-render', (req, res) => {
    const { product, timestamp, url } = req.query;
    // Default to localhost:3003 if not specified, or use the provided url param
    // But simplest is to reconstruct the target URL from the query params
    // strict param validation to avoid abuse? For test server, simple is fine.
    
    // Check if we have product/timestamp OR a full url
    let targetUrl;
    if (url) {
        targetUrl = url;
    } else if (product && timestamp) {
        targetUrl = `http://localhost:3003/renders/download?product=${product}&timestamp=${timestamp}`;
    } else {
        return res.status(400).send("Missing parameters");
    }

    // console.log(`Proxying request to: ${targetUrl}`);

    const externalReq = http.get(targetUrl, (externalRes) => {
        // Forward status
        res.status(externalRes.statusCode);
        
        // Forward headers, but STRIP restrictive ones
        Object.keys(externalRes.headers).forEach(key => {
            if (key.toLowerCase() !== 'cross-origin-resource-policy' && 
                key.toLowerCase() !== 'content-security-policy') {
                res.setHeader(key, externalRes.headers[key]);
            }
        });
        
        // Add CORS permissive headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        // Pipe data
        externalRes.pipe(res);
    });
    
    externalReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(502).send("Proxy Error");
    });
});

// Function to find an available port
function listenOnAvailablePort(startPort) {
    const server = http.createServer(app);
    
    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${startPort} in use, trying ${startPort + 1}...`);
            listenOnAvailablePort(startPort + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(startPort, () => {
        console.log(`UI Test Server running at http://localhost:${startPort}`);
        console.log(`This is a separate test instance. API connections are client-side.`);
    });
}

listenOnAvailablePort(START_PORT);
