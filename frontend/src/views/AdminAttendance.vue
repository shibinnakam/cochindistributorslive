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
        <button @click="fetchAttendance" class="btn-refresh" :disabled="loading">
          <span v-if="loading">Refreshing...</span>
          <span v-else>🔄 Refresh</span>
        </button>
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
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in attendanceRecords" :key="record._id">
            <td class="name-cell">
              <div class="staff-info">
                <div class="avatar-sm">
                  {{ record.staffName ? record.staffName.charAt(0).toUpperCase() : '?' }}
                </div>
                <span>{{ record.staffName || '—' }}</span>
              </div>
            </td>
            <td>{{ record.position || '—' }}</td>
            <td class="time-cell">{{ formatTime(record.inTime) }}</td>
            <td class="time-cell">{{ formatTime(record.outTime) }}</td>
            <td class="hours-cell">
              <span v-if="record.workingHours" class="hours-badge">{{ record.workingHours }}</span>
              <span v-else class="pending">—</span>
            </td>
            <td>
              <span v-if="record.outTime" class="status-badge success">Checked Out</span>
              <span v-else class="status-badge progress">Checked In</span>
            </td>
          </tr>
          <tr v-if="attendanceRecords.length === 0 && !loading">
            <td colspan="6" class="no-data">No attendance records found for this date.</td>
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
      selectedDate: new Date().toISOString().split('T')[0],
      loading: false,
      refreshInterval: null
    };
  },
  computed: {
    currentlyInCount() {
      return this.attendanceRecords.filter(r => r.inTime && !r.outTime).length;
    },
    completedCount() {
      return this.attendanceRecords.filter(r => r.outTime).length;
    }
  },
  methods: {
    async fetchAttendance() {
      this.loading = true;
      try {
        const res = await axios.get(`/api/attendance?date=${this.selectedDate}`);
        if (res.data.success) {
          this.attendanceRecords = res.data.records;
        }
      } catch (err) {
        console.error("Error fetching attendance:", err);
      } finally {
        this.loading = false;
      }
    },
    formatTime(dateStr) {
      if (!dateStr) return "—";
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  },
  mounted() {
    this.fetchAttendance();
    
    // Listen for real-time attendance updates
    socket.on("attendanceUpdate", (data) => {
      // Only refresh if we are looking at today's date
      const today = new Date().toISOString().split('T')[0];
      if (this.selectedDate === today) {
        this.fetchAttendance();
      }
    });
  },
  beforeUnmount() {
    socket.off("attendanceUpdate");
  }
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
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
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

.green-text { color: #10b981 !important; }
.blue-text { color: #3b82f6 !important; }

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
