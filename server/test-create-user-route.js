const http = require('http');

const options = {
    hostname: '127.0.0.1',
    port: 5001,
    path: '/api/admin/create-user',
    method: 'POST', // POST should return 400 or JSON, not 404 if route exists
    headers: { 'Content-Type': 'application/json' }
};

const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`); // Should NOT be 404
});

req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
});

req.end();
