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
