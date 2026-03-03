const axios = require('axios');

/**
 * AI-Driven Behavioral Anomaly Detection Verification Script
 * 
 * This script demonstrates the enhanced features:
 * 1. Proxy Attendance Detection (Rapid bursts)
 * 2. 5-Way Algorithm Comparison (Research Paper Requirement)
 */

// ✅ Set to true to test against LIVE Render, false for localhost
const USE_LIVE = true;

const LIVE_BACKEND_URL = 'https://www.cochindistributors.xyz'; // Your Render backend URL
const LIVE_AI_URL = 'https://python-ai-service.onrender.com'; // Your Render AI service URL

const API_URL = USE_LIVE ? `${LIVE_BACKEND_URL}/api/attendance` : 'http://localhost:5000/api/attendance';
const AI_URL = USE_LIVE ? LIVE_AI_URL : 'http://localhost:5001';
const TEST_UID = 'D08AA55F'; // Ensure this exists in your Staff collection

async function verifyProxyDetection() {
    console.log('\n--- 1. Testing Proxy Detection (Burst Scans) ---');
    console.log('Simulating 3 rapid scans to trigger "frequencyScore" anomaly...');

    try {
        // First scan (Check-IN)
        console.log('Scaning first card...');
        const res1 = await axios.post(`${API_URL}/scan`, { rfidUid: TEST_UID });
        console.log(`Scan 1: ${res1.data.message}`);

        // Second scan (Check-OUT immediately - triggers proxy burst detection)
        console.log('\nScanning same card again immediately (<2s)...');
        const res2 = await axios.post(`${API_URL}/scan`, { rfidUid: TEST_UID });

        console.log('--- Response from Anomaly Detection Engine ---');
        console.log(`Anomaly Score: ${res2.data.record.anomalyScore}%`);
        console.log(`Anomaly Status: ${res2.data.record.anomalyStatus}`);
        console.log('Reasons:', res2.data.record.features);

        if (res2.data.record.anomalyStatus === 'Suspicious') {
            console.log('✅ SUCCESS: Proxy burst detected!');
        } else {
            console.log('❌ FAILED: Burst was not flagged. Check frequencyScore logic.');
        }

    } catch (err) {
        console.error('Error in proxy test:', err.response?.data || err.message);
    }
}

async function verifyAlgorithmComparison() {
    console.log('\n--- 2. Testing 5-Way Algorithm Comparison ---');
    console.log('Sending sample dataset to research benchmark endpoint...');

    // Sample data simulating [duration, arrival_dev, scan_interval, short_stay, inter_arrival, frequency]
    const sampleFeatures = [
        { duration_minutes: 480, arrival_deviation: 5, scan_interval: 1, short_stay_count: 0, inter_arrival_time: 300000, frequency_score: 1 },
        { duration_minutes: 475, arrival_deviation: 10, scan_interval: 1, short_stay_count: 0, inter_arrival_time: 320000, frequency_score: 1 },
        { duration_minutes: 5, arrival_deviation: 120, scan_interval: 1, short_stay_count: 1, inter_arrival_time: 1500, frequency_score: 5 }, // Anomaly
        { duration_minutes: 490, arrival_deviation: 2, scan_interval: 1, short_stay_count: 0, inter_arrival_time: 310000, frequency_score: 1 },
        { duration_minutes: 485, arrival_deviation: 8, scan_interval: 1, short_stay_count: 0, inter_arrival_time: 305000, frequency_score: 1 },
        { duration_minutes: 482, arrival_deviation: 4, scan_interval: 1, short_stay_count: 0, inter_arrival_time: 315000, frequency_score: 1 }
    ];

    try {
        const response = await axios.post(`${AI_URL}/compare`, { features: sampleFeatures });
        if (response.data.success) {
            console.log('✅ Algorithmic Benchmark Results (Time in ms / Anomaly Count):');
            console.table(response.data.comparison);
        } else {
            console.error('❌ AI Benchmark Failed:', response.data.error);
        }
    } catch (err) {
        console.error('Error in comparison test:', err.response?.data || err.message);
    }
}

async function run() {
    console.log('🚀 Starting Research Logic Verification...');
    await verifyAlgorithmComparison();
    await verifyProxyDetection();
    console.log('\n--- Verification Complete ---');
}

run();
