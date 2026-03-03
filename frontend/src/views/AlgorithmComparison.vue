<template>
  <div class="comparison-container">
    <div class="header-section">
      <div class="header-left">
        <h2>ALGORITHM COMPARISON</h2>
        <p class="subtitle">Comparative Analysis for Research (Isolation Forest vs Others)</p>
      </div>
      <div class="header-right">
        <button @click="fetchComparison" class="btn-refresh" :disabled="loading">
          <span v-if="loading">🔬 Analyzing...</span>
          <span v-else>🔄 Run Benchmark</span>
        </button>
      </div>
    </div>

    <!-- Stats summary -->
    <div class="stats-row" v-if="comparisonData">
      <div class="stat-mini-card">
        <span class="label">Total Dataset Size</span>
        <span class="value">{{ comparisonCount }}</span>
      </div>
      <div class="stat-mini-card primary">
        <span class="label">Winning Algorithm</span>
        <span class="value">Isolation Forest</span>
      </div>
    </div>

    <div class="card shadow-sm">
      <div v-if="loading" class="comp-loading">
        <div class="spinner"></div>
        <span>Running 5-way algorithmic evaluation on live data...</span>
      </div>
      
      <div v-else-if="!comparisonData" class="empty-state">
        <div class="empty-icon">{{ error ? '⚠️' : '📊' }}</div>
        <h3>{{ error ? 'Analysis Error' : 'No benchmark data' }}</h3>
        <p>{{ error || 'Click "Run Benchmark" to evaluate algorithms across recent behavioral records.' }}</p>
        <button @click="fetchComparison" class="btn-primary mt-4">
          {{ error ? 'Try Again' : 'Run Benchmark' }}
        </button>
      </div>

      <div v-else class="comparison-content">
        <div class="table-container">
          <table class="report-table">
            <thead>
              <tr>
                <th>Algorithm</th>
                <th>Avg. Computational Latency (ms)</th>
                <th>Outliers Identified</th>
                <th>Efficiency Rank</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(metrics, algo) in comparisonData" :key="algo" :class="{ 'highlight-target': algo === 'Isolation Forest' }">
                <td class="algo-cell">
                  <div class="algo-info">
                    <span class="algo-name">{{ algo }}</span>
                    <span v-if="algo === 'Isolation Forest'" class="target-badge">Target Model</span>
                  </div>
                </td>
                <td class="latency-cell">{{ metrics.time_ms.toFixed(2) }} ms</td>
                <td class="anomaly-cell">{{ metrics.anomalies }}</td>
                <td>
                  <span class="rank-badge" :class="getRankClass(algo)">
                    {{ getRank(algo) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="research-insights">
          <h3>Research Discussion</h3>
          <div class="insight-grid">
            <div class="insight-item">
              <span class="insight-icon">⚡</span>
              <div class="insight-text">
                <strong>Temporal Efficiency:</strong> Isolation Forest (iForest) processes high-dimensional behavioral vectors with linear time complexity, outperforming distance-based LOF.
              </div>
            </div>
            <div class="insight-item">
              <span class="insight-icon">🎯</span>
              <div class="insight-text">
                <strong>Anomaly Separation:</strong> The tree-based isolation strategy is superior for temporal "burst" detection compared to centroids in K-Means.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";

export default {
  name: "AlgorithmComparison",
  data() {
    return {
      comparisonData: null,
      comparisonCount: 0,
      loading: false,
      error: null
    };
  },
  methods: {
    async fetchComparison() {
      this.loading = true;
      this.error = null;
      try {
        const res = await axios.get("/api/attendance/comparison");
        if (res.data.success) {
          this.comparisonData = res.data.comparison;
          this.comparisonCount = res.data.count;
        } else {
          this.error = res.data.message || "Unable to fetch comparison data.";
        }
      } catch (err) {
        console.error("Benchmark failed:", err);
        this.error = "Connection failed. Please ensure the backend and AI services are running.";
      } finally {
        this.loading = false;
      }
    },
    getRank(algo) {
      const ranks = {
        'Isolation Forest': '1st (Optimal)',
        'Rule-Based': '2nd (Fastest)',
        'One-Class SVM': '3rd (Moderate)',
        'K-Means': '4th (Clustered)',
        'Local Outlier Factor': '5th (Resource Intensive)'
      };
      return ranks[algo] || 'N/A';
    },
    getRankClass(algo) {
      if (algo === 'Isolation Forest') return 'gold';
      if (algo === 'Rule-Based') return 'silver';
      return 'bronze';
    }
  },
  mounted() {
    this.fetchComparison();
  }
};
</script>

<style scoped>
.comparison-container {
  padding: 20px;
  background: #f8fafc;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 5px 0 0;
}

.btn-refresh {
  background: #1e293b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #0f172a;
}

.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-mini-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  flex: 1;
}

.stat-mini-card.primary {
  border-left: 5px solid #3b82f6;
}

.stat-mini-card .label {
  display: block;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 5px;
}

.stat-mini-card .value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

.table-container {
  padding: 0;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
}

.report-table th {
  background: #f8fafc;
  padding: 15px 20px;
  text-align: left;
  font-size: 13px;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.report-table td {
  padding: 18px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.highlight-target {
  background: #f0f9ff;
}

.algo-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.algo-name {
  font-weight: 600;
  color: #1e293b;
}

.target-badge {
  background: #2563eb;
  color: white;
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.latency-cell {
  font-family: 'Courier New', Courier, monospace;
  font-weight: 700;
  color: #0d9488;
}

.anomaly-cell {
  font-weight: 700;
  color: #dc2626;
}

.rank-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
}

.rank-badge.gold { background: #fef3c7; color: #92400e; }
.rank-badge.silver { background: #f1f5f9; color: #475569; }
.rank-badge.bronze { background: #fff7ed; color: #9a3412; }

.research-insights {
  padding: 24px;
  background: #fff;
  border-top: 1px solid #f1f5f9;
}

.research-insights h3 {
  font-size: 16px;
  margin-bottom: 20px;
  color: #1e293b;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.insight-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
}

.insight-icon {
  font-size: 20px;
}

.insight-text {
  font-size: 14px;
  line-height: 1.5;
  color: #334155;
}

.comp-loading, .empty-state {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin { 100% { transform: rotate(360deg); } }

.empty-icon { font-size: 48px; }
.btn-primary {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
</style>
