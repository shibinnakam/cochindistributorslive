<template>
  <div class="attendance-container">
    <div class="header-section">
      <div class="header-left">
        <h2>DAILY ATTENDANCE</h2>
        <span class="current-date">Date: {{ selectedDate }}</span>
      </div>
      <div class="header-right">
        <div class="date-picker-wrapper">
          <label for="attendance-date">Select Date: </label>
          <input
            type="date"
            id="attendance-date"
            v-model="selectedDate"
            @change="fetchAttendance"
            class="date-input"
          />
        </div>
        <button
          @click="runComparison"
          class="btn-research"
          :disabled="compLoading"
        >
          🔬 Algorithm Comparison
        </button>
        <button
          @click="fetchAttendance"
          class="btn-refresh"
          :disabled="loading"
        >
          <span v-if="loading">Refreshing...</span>
          <span v-else>🔄 Refresh</span>
        </button>
      </div>
    </div>

    <!-- Research Comparison Section -->
    <div class="research-section" v-if="showComparison">
      <div class="comparison-card shadow-sm">
        <div class="card-header">
          <h3>Algorithm Comparison (Research Benchmark)</h3>
          <button @click="showComparison = false" class="btn-close">×</button>
        </div>
        <div v-if="compLoading" class="comp-loading">
          <div class="spinner"></div>
          <span>Analyzing recent records across 5 algorithms...</span>
        </div>
        <div v-else-if="comparisonData" class="comparison-content">
          <p class="data-info">Analysis performed on the last <b>{{ comparisonCount }}</b> attendance records with behavioral features.</p>
          <div class="comp-table-wrapper">
            <table class="comp-table">
              <thead>
                <tr>
                  <th>Algorithm</th>
                  <th>Computational Latency (ms)</th>
                  <th>Anomalies Detected</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(metrics, algo) in comparisonData" :key="algo" :class="{ 'highlight-algo': algo === 'Isolation Forest' }">
                  <td class="algo-name">
                    {{ algo }}
                    <span v-if="algo === 'Isolation Forest'" class="target-badge">Target Model</span>
                  </td>
                  <td class="latency-cell">{{ metrics.time_ms.toFixed(2) }}ms</td>
                  <td class="anomaly-cell">{{ metrics.anomalies }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="research-note">
            <span class="note-icon">💡</span>
            <p><b>Research Insight:</b> Isolation Forest demonstrates superior performance in computational complexity and anomaly discrimination for this RFID-based multi-dimensional behavioral feature space.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance Stats -->
    <div class="stats-row">
      <div class="stat-mini-card">
        <span class="label">Total Records</span>
        <span class="value">{{ attendanceRecords.length }}</span>
      </div>
      <div class="stat-mini-card">
        <span class="label">Currently In</span>
        <span class="value green-text">{{ currentlyInCount }}</span>
      </div>
      <div class="stat-mini-card">
        <span class="label">Completed Today</span>
        <span class="value blue-text">{{ completedCount }}</span>
      </div>
    </div>

    <div class="table-container shadow-sm">
      <table class="report-table">
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Position</th>
            <th>In Time</th>
            <th>Out Time</th>
            <th>Working Hours</th>
            <th>Anomaly Status</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in attendanceRecords" :key="record._id">
            <td class="name-cell">
              <div class="staff-info">
                <div class="avatar-sm">
                  {{
                    record.staffName
                      ? record.staffName.charAt(0).toUpperCase()
                      : "?"
                  }}
                </div>
                <span>{{ record.staffName || "—" }}</span>
              </div>
            </td>
            <td>{{ record.position || "—" }}</td>
            <td class="time-cell">{{ formatTime(record.inTime) }}</td>
            <td class="time-cell">{{ formatTime(record.outTime) }}</td>
            <td class="hours-cell">
              <span v-if="record.workingHours" class="hours-badge">{{
                record.workingHours
              }}</span>
              <span v-else class="pending">—</span>
            </td>
            <td>
              <span v-if="record.anomalyStatus === 'Suspicious'" class="status-badge danger" :title="'Anomaly Score: ' + record.anomalyScore">
                Suspicious ({{ record.anomalyScore }}%)
              </span>
              <span v-else-if="record.outTime" class="status-badge info">
                Normal
              </span>
              <span v-else class="pending">—</span>
            </td>
            <td>
              <span v-if="record.outTime" class="status-badge success"
                >Checked Out</span
              >
              <span v-else class="status-badge progress">Checked In</span>
            </td>
          </tr>
          <tr v-if="attendanceRecords.length === 0 && !loading">
            <td colspan="6" class="no-data">
              No attendance records found for this date.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";
import socket from "@/socket";

export default {
  name: "AdminAttendance",
  data() {
    return {
      attendanceRecords: [],
      selectedDate: new Date().toISOString().split("T")[0],
      loading: false,
      refreshInterval: null,
      showComparison: false,
      compLoading: false,
      comparisonData: null,
      comparisonCount: 0
    };
  },
  computed: {
    currentlyInCount() {
      return this.attendanceRecords.filter((r) => r.inTime && !r.outTime)
        .length;
    },
    completedCount() {
      return this.attendanceRecords.filter((r) => r.outTime).length;
    },
  },
  methods: {
    async fetchAttendance() {
      this.loading = true;
      try {
        const res = await axios.get(
          `/api/attendance?date=${this.selectedDate}`
        );
        if (res.data.success) {
          this.attendanceRecords = res.data.records;
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        this.loading = false;
      }
    },
    async runComparison() {
      this.showComparison = true;
      this.compLoading = true;
      try {
        const res = await axios.get("/api/attendance/comparison");
        if (res.data.success) {
          this.comparisonData = res.data.comparison;
          this.comparisonCount = res.data.count;
        }
      } catch (err) {
        console.error("Comparison error:", err);
      } finally {
        this.compLoading = false;
      }
    },
    formatTime(dateStr) {
      if (!dateStr) return "—";
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
  mounted() {
    this.fetchAttendance();

    // Listen for real-time attendance updates
    socket.on("attendanceUpdate", () => {
      // Only refresh if we are looking at today's date
      const today = new Date().toISOString().split("T")[0];
      if (this.selectedDate === today) {
        this.fetchAttendance();
      }
    });
  },
  beforeUnmount() {
    socket.off("attendanceUpdate");
  },
};
</script>

<style scoped>
.attendance-container {
  padding: 20px;
  background: #f8fafc;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 15px;
}

.header-left h2 {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.current-date {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #475569;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #1e293b;
  font-weight: 500;
}

.btn-refresh {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-research {
  background: #1e293b;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-research:hover {
  background: #0f172a;
  transform: translateY(-1px);
}

.btn-research:disabled {
  background: #94a3b8;
  cursor: not-allowed;
}

/* Research Comparison Styles */
.research-section {
  margin-bottom: 24px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.comparison-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #3b82f6;
  overflow: hidden;
}

.comparison-card .card-header {
  background: #eff6ff;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #dbeafe;
}

.comparison-card .card-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e40af;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  line-height: 1;
}

.comparison-content {
  padding: 20px;
}

.data-info {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 15px;
}

.comp-table-wrapper {
  overflow-x: auto;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 15px;
}

.comp-table {
  width: 100%;
  border-collapse: collapse;
}

.comp-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  border-bottom: 1px solid #e2e8f0;
}

.comp-table td {
  padding: 12px;
  font-size: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.highlight-algo {
  background: #f0f9ff;
}

.algo-name {
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.target-badge {
  background: #3b82f6;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
}

.latency-cell {
  font-family: monospace;
  font-weight: 600;
  color: #0891b2;
}

.anomaly-cell {
  font-weight: 700;
  color: #dc2626;
  text-align: center;
}

.research-note {
  display: flex;
  gap: 12px;
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.note-icon {
  font-size: 18px;
}

.research-note p {
  margin: 0;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
}

.comp-loading {
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  color: #64748b;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-mini-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-mini-card .label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.stat-mini-card .value {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.green-text {
  color: #10b981 !important;
}
.blue-text {
  color: #3b82f6 !important;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #f1f5f9;
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
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #f1f5f9;
}

.report-table td {
  padding: 15px 20px;
  font-size: 14px;
  color: #334155;
  border-bottom: 1px solid #f1f5f9;
}

.name-cell {
  font-weight: 600;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-sm {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.time-cell {
  font-family: monospace;
  font-weight: 600;
  color: #475569;
}

.hours-badge {
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  color: #1e293b;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.status-badge.success {
  background: #ecfdf5;
  color: #059669;
}

.status-badge.progress {
  background: #fff7ed;
  color: #d97706;
}
.status-badge.danger {
  background: #fef2f2;
  color: #dc2626;
  cursor: help;
}
.status-badge.info {
  background: #f0f9ff;
  color: #0369a1;
}

.no-data {
  text-align: center;
  padding: 40px !important;
  color: #94a3b8;
}

.pending {
  color: #94a3b8;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
