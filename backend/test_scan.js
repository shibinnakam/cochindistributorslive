const https = require('https');

// ✅ Change this to your actual RFID card UID
const RFID_UID = 'D08AA55F';

// ✅ Set to true to test against live Render, false for localhost
const USE_LIVE = true;

const LIVE_HOST = 'www.cochindistributors.xyz'; // your live domain
const LOCAL_HOST = 'localhost';
const LOCAL_PORT = 5000;

function sendScan(label) {
    const body = JSON.stringify({ rfidUid: RFID_UID });

    const options = USE_LIVE ? {
        hostname: LIVE_HOST,
        path: '/api/attendance/scan',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }
    } : {
        hostname: LOCAL_HOST,
        port: LOCAL_PORT,
        path: '/api/attendance/scan',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': body.length }
    };

    const lib = USE_LIVE ? https : require('http');
    const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (d) => { data += d; });
        res.on('end', () => {
            console.log(`\n--- ${label} ---`);
            console.log(`Status: ${res.statusCode}`);
            try {
                const parsed = JSON.parse(data);
                console.log('Response:', JSON.stringify(parsed, null, 2));
                if (parsed.anomalyStatus) {
                    console.log(`\n🤖 AI Result: ${parsed.anomalyStatus} (Score: ${parsed.anomalyScore}%)`);
                }
            } catch (e) {
                console.log(data);
            }
        });
    });

    req.on('error', (err) => console.error('Error:', err.message));
    req.write(body);
    req.end();
}

// Simulate: IN scan → wait 3 seconds → OUT scan (short stay = suspicious)
console.log('🔵 Sending IN scan...');
sendScan('SCAN 1 (Check-IN)');

setTimeout(() => {
    console.log('\n🔴 Sending OUT scan after 3 seconds (short stay)...');
    sendScan('SCAN 2 (Check-OUT → AI analyzes this)');
}, 3000);
