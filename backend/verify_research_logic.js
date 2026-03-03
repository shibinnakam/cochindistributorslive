/**
 * Research Verification Script for Shibin Saji
 * Testing: Behavioral Anomaly Detection & Algorithm Comparison
 */
const axios = require('axios');

// CONFIGURATION - Change to true to test against live Render URLs
const USE_LIVE = true;
const BASE_URL = USE_LIVE ? "https://cochindistributors.xyz" : "http://localhost:5000";

async function verifyAI() {
    console.log(`\n--- 🔬 Starting Research Logic Verification (${BASE_URL}) ---`);

    try {
        // 1. Check AI Health
        console.log("\n[1/3] Checking AI Service Health...");
        const health = await axios.get(`${BASE_URL}/api/attendance/comparison`).catch(e => e.response);
        if (health && health.status === 200) {
            console.log("✅ AI Benchmark endpoint is REACHABLE.");
        } else {
            console.log("⚠️ Comparison endpoint check failed. Ensure code is deployed.");
        }

        // 2. Simulate "Buddy Punching" (Proxy Attack)
        console.log("\n[2/3] Simulating Proxy Attendance Attack...");
        const proxyUid = "PROXY_TEST_" + Date.now();
        console.log(`Scanning card ${proxyUid} twice in 1 second...`);

        await axios.post(`${BASE_URL}/api/attendance/scan`, { rfidUid: proxyUid });
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 500));
        const res2 = await axios.post(`${BASE_URL}/api/attendance/scan`, { rfidUid: proxyUid });

        console.log("Response for second scan (Check-out):");
        if (res2.data.message.includes("Suspicious")) {
            console.log("✅ SUCCESS: Proxy scan detected by AI logic!");
        } else {
            console.log("❌ FAILED: Scan was not flagged as suspicious. Check Inter-arrival logic.");
        }

        // 3. Trigger Full Algorithm Comparison
        console.log("\n[3/3] Triggering 5-Way Algorithm Benchmark...");
        const compRes = await axios.get(`${BASE_URL}/api/attendance/comparison`);
        if (compRes.data.success) {
            console.log("✅ SUCCESS: Received comparative data for 5 algorithms.");
            console.table(compRes.data.comparison);
        } else {
            console.log("❌ FAILED: Could not fetch comparison data.");
        }

    } catch (err) {
        console.error("\n❌ Error during verification:", err.message);
        if (err.response) console.error("Response data:", err.response.data);
    }
}

verifyAI();
