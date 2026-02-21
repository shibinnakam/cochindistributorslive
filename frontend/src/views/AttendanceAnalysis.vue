<template>
  <div class="analysis-container">
    <div class="analysis-header">
      <div class="controls">
        <label for="month-select">Select Month:</label>
        <input 
          type="month" 
          id="month-select" 
          v-model="selectedMonth" 
          @change="fetchAnalysis"
          class="month-input"
        >
        <button @click="fetchAnalysis" class="refresh-btn" :disabled="loading">
          {{ loading ? 'Loading...' : '🔄 Refresh' }}
        </button>
      </div>
    </div>

    <!-- Graph Card -->
    <div class="card graph-card">
      <div class="card-header">
        <h3>Working Hours Distribution</h3>
        <span class="legend">
          <span class="legend-item"><span class="dot green"></span> Present</span>
          <span class="legend-item"><span class="dot red"></span> Absent</span>
        </span>
      </div>
      <div class="chart-container">
        <canvas ref="attendanceChart"></canvas>
      </div>
      <div v-if="!loading && (!staffList || staffList.length === 0)" class="no-data">
        No staff records found for this period.
      </div>
    </div>

    <!-- Summary Table Card -->
    <div class="card table-card">
      <div class="card-header">
        <h3>Monthly Summary</h3>
      </div>
      <div class="table-wrapper">
        <table class="summary-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Position</th>
              <th>Total Hours (Month)</th>
              <th>Avg. Daily Hours</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="staff in staffList" :key="staff._id">
              <td>
                <div class="staff-info">
                  <div class="staff-avatar">{{ staff.name.charAt(0) }}</div>
                  <span>{{ staff.name }}</span>
                </div>
              </td>
              <td>{{ staff.position }}</td>
              <td>
                <span class="hours-badge">{{ formatMs(summaries[staff._id]?.totalMs) }}</span>
              </td>
              <td>
                {{ formatMs(summaries[staff._id]?.totalMs / workingDaysInMonth) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';
import axios from '@/utils/axios';

export default {
  name: 'AttendanceAnalysis',
  data() {
    const now = new Date();
    // UTC+5:30 for consistency with backend todayIST
    const istNow = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
    const month = `${istNow.getFullYear()}-${String(istNow.getMonth() + 1).padStart(2, '0')}`;
    return {
      selectedMonth: month,
      loading: false,
      staffList: [],
      daysList: [],
      attendanceData: {},
      summaries: {},
      chart: null,
      todayStr: istNow.toISOString().split('T')[0]
    };
  },
  computed: {
    daysInMonth() {
      if (!this.selectedMonth) return 30;
      const [year, month] = this.selectedMonth.split('-').map(Number);
      return new Date(year, month, 0).getDate();
    },
    workingDaysInMonth() {
      if (!this.daysList || this.daysList.length === 0) return this.daysInMonth;
      // Count non-Sunday days in the daysList
      return this.daysList.filter(day => new Date(day).getDay() !== 0).length;
    }
  },
  mounted() {
    this.fetchAnalysis();
  },
  methods: {
    formatMs(ms) {
      if (!ms || ms < 0) return "0h 0m 0s";
      const totalSeconds = Math.floor(ms / 1000);
      const h = Math.floor(totalSeconds / 3600);
      const m = Math.floor((totalSeconds % 3600) / 60);
      const s = totalSeconds % 60;
      return `${h}h ${m}m ${s}s`;
    },
    async fetchAnalysis() {
      this.loading = true;
      try {
        const res = await axios.get(`/api/attendance/analysis?month=${this.selectedMonth}`);
        if (res.data.success) {
          this.staffList = res.data.staff;
          this.daysList = res.data.days;
          this.attendanceData = res.data.data;
          this.summaries = res.data.summaries;
          this.renderChart();
        }
      } catch (err) {
        console.error("Analysis fetch error:", err);
      } finally {
        this.loading = false;
      }
    },
    renderChart() {
      const ctx = this.$refs.attendanceChart.getContext('2d');
      if (this.chart) {
        this.chart.destroy();
      }

      const datasets = [
        {
          label: 'Present',
          data: [],
          backgroundColor: '#4ade80', // Green
          pointRadius: 6,
          pointHoverRadius: 8
        },
        {
          label: 'Absent',
          data: [],
          backgroundColor: '#f87171', // Red
          pointRadius: 6,
          pointHoverRadius: 8
        }
      ];

      // Prepare data for the scatter plot
      // X = staff name (index), Y = day of month
      this.staffList.forEach((staff, sIdx) => {
        this.daysList.forEach((dayStr) => {
          const dayNum = parseInt(dayStr.split('-')[2]);
          const record = this.attendanceData[staff._id]?.[dayStr];
          const isSunday = new Date(dayStr).getDay() === 0;
          
          if (record && record.present) {
            datasets[0].data.push({
              x: sIdx,
              y: dayNum,
              hours: record.hours,
              isHoliday: isSunday
            });
          } else {
            // Only add red dot if date <= today AND NOT Sunday
            if (dayStr <= this.todayStr && !isSunday) {
               datasets[1].data.push({
                x: sIdx,
                y: dayNum,
                hours: 0
              });
            }
          }
        });
      });

      this.chart = new Chart(ctx, {
        type: 'scatter',
        data: {
          datasets: datasets
        },
        plugins: [{
          id: 'sundayLabels',
          afterDraw: (chart) => {
            const { ctx, chartArea: { left, right }, scales: { y } } = chart;
            ctx.save();
            ctx.font = 'bold 12px sans-serif';
            ctx.fillStyle = '#1e3a8a'; // Dark blue
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            this.daysList.forEach((dayStr) => {
              if (new Date(dayStr).getDay() === 0) {
                const dayNum = parseInt(dayStr.split('-')[2]);
                const yPos = y.getPixelForValue(dayNum);
                // Draw multiple times across the width for better visibility
                const text = 'SUNDAY (HOLIDAY)';
                const centerX = (left + right) / 2;
                ctx.fillText(text, centerX, yPos);
              }
            });
            ctx.restore();
          }
        }],
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              ticks: {
                stepSize: 1,
                autoSkip: false,
                callback: (value) => {
                  // value is the internal numeric value
                  if (Math.floor(value) === value) {
                    return this.staffList[value]?.name || '';
                  }
                  return '';
                }
              },
              title: {
                display: true,
                text: 'Staff Employees'
              },
              min: -0.5,
              max: this.staffList.length - 0.5
            },
            y: {
              title: {
                display: true,
                text: 'Day of Month'
              },
              ticks: {
                stepSize: 1,
                autoSkip: false
              },
              min: 1,
              max: this.daysInMonth
            }
          },
          plugins: {
            tooltip: {
              callbacks: {
                label: (context) => {
                  const staffName = this.staffList[context.raw.x]?.name;
                  const day = context.raw.y;
                  const hours = context.raw.hours;
                  const isHoliday = context.raw.isHoliday;
                  return `${staffName} - Day ${day}${isHoliday ? ' (Holiday)' : ''}: ${hours.toFixed(2)}h`;
                }
              }
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.analysis-container {
  padding: 20px;
  background-color: #f8fafc;
  min-height: 100%;
}

.analysis-header {
  margin-bottom: 25px;
}

.controls {
  display: flex;
  align-items: center;
  gap: 15px;
  background: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  width: fit-content;
}

.month-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  outline: none;
  font-family: inherit;
}

.refresh-btn {
  padding: 8px 16px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background: #4338ca;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
}

.card-header h3 {
  font-size: 1.1rem;
  color: #1e293b;
  margin: 0;
}

.chart-container {
  height: 400px;
  position: relative;
}

.legend {
  display: flex;
  gap: 15px;
  font-size: 0.85rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.green { background-color: #4ade80; }
.dot.red { background-color: #f87171; }

.table-wrapper {
  overflow-x: auto;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.summary-table th {
  padding: 12px;
  background: #f8fafc;
  color: #64748b;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
}

.summary-table td {
  padding: 15px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
}

.staff-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.staff-avatar {
  width: 32px;
  height: 32px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #475569;
  font-size: 0.8rem;
}

.hours-badge {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #94a3b8;
}
</style>
