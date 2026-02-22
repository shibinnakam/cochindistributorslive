const http = require('http');

const data = JSON.stringify({
    rfidUid: 'D08AA55F'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/attendance/scan',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error connecting to server. Is it running on port 5000?');
    console.error(error.message);
});

req.write(data);
req.end();
