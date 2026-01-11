const express = require('express');
const path = require('path');
const http = require('http'); // Required for proxy

const app = express();
const PORT = process.env.PORT || 3000;

// Serve public assets (css, js, images)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
// Serve utils for the interactive map
app.use('/utils', express.static(path.join(__dirname, 'utils')));


// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/coming-soon', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'coming-soon.html'));
});

app.get('/interactive-map', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'interactive-map.html'));
});

// Proxy endpoint for EWMRS images (copied from dev server)
app.get('/proxy-render', (req, res) => {
    const { product, timestamp, url } = req.query;
    
    let targetUrl;
    if (url) {
        targetUrl = url;
    } else if (product && timestamp) {
        targetUrl = `http://localhost:3003/renders/download?product=${product}&timestamp=${timestamp}`;
    } else {
        return res.status(400).send("Missing parameters");
    }

    const externalReq = http.get(targetUrl, (externalRes) => {
        res.status(externalRes.statusCode);
        
        // Forward headers, strip restrictive ones
        Object.keys(externalRes.headers).forEach(key => {
            if (key.toLowerCase() !== 'cross-origin-resource-policy' && 
                key.toLowerCase() !== 'content-security-policy') {
                res.setHeader(key, externalRes.headers[key]);
            }
        });
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        externalRes.pipe(res);
    });
    
    externalReq.on('error', (err) => {
        console.error('Proxy error:', err);
        res.status(502).send("Proxy Error");
    });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`EdgeWARN server listening on http://localhost:${PORT}`);
});
