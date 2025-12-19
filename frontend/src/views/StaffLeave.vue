<template>
  <div class="leave-container">
    <!-- Header -->
    <div class="leave-header">
      <h2>📋 Apply for Leave</h2>
      <p>Submit your leave request for approval</p>
    </div>

    <!-- Form -->
    <form @submit.prevent="submitLeave" class="leave-form-modern">
      <!-- Date Field -->
      <div class="form-group-leave">
        <label for="leave-date" class="form-label-leave">
          📅 Select Date
        </label>
        <div class="calendar-wrapper">
          <div class="calendar-container" v-show="showCalendar">
            <div class="calendar-header">
              <button type="button" @click="previousMonth" class="nav-btn">
                ◀
              </button>
              <span class="current-month">{{ monthYear }}</span>
              <button type="button" @click="nextMonth" class="nav-btn">
                ▶
              </button>
            </div>
            <div class="weekdays">
              <div class="weekday" v-for="day in weekdays" :key="day">
                {{ day }}
              </div>
            </div>
            <div class="dates-grid">
              <button
                type="button"
                v-for="day in calendarDays"
                :key="day.date"
                @click="selectDate(day.date)"
                :class="[
                  'date-btn',
                  {
                    'other-month': !day.isCurrentMonth,
                    selected: day.date === date,
                    'has-leave': leaves.some((l) => l.date === day.date),
                  },
                ]"
                :disabled="
                  !day.isCurrentMonth || leaves.some((l) => l.date === day.date)
                "
                :title="
                  leaves.some((l) => l.date === day.date)
                    ? 'Leave already applied for this date'
                    : ''
                "
              >
                {{ day.day }}
              </button>
            </div>
          </div>
          <div class="date-display">
            <input
              id="leave-date"
              type="text"
              v-model="date"
              @focus="showCalendar = true"
              @blur="showCalendar = false"
              placeholder="Click to select date"
              readonly
              class="date-input-modern"
            />
            <span class="date-icon">📆</span>
          </div>
        </div>
      </div>

      <!-- Reason Field -->
      <div class="form-group-leave">
        <label for="leave-reason" class="form-label-leave">
          ✏️ Reason for Leave
        </label>
        <textarea
          id="leave-reason"
          v-model="reason"
          placeholder="Enter your reason for leave..."
          required
          class="textarea-modern"
        ></textarea>
      </div>

      <!-- Buttons -->
      <div class="button-group-leave">
        <button
          type="submit"
          :disabled="loading || dateHasLeave || !date"
          class="btn-submit-leave"
        >
          <span v-if="!loading && !dateHasLeave">✓ Request Leave</span>
          <span v-else-if="dateHasLeave">⚠️ Already Applied</span>
          <span v-else>⏳ Submitting...</span>
        </button>
        <button
          type="button"
          @click="resetForm"
          :disabled="loading"
          class="btn-clear-leave"
        >
          ⟲ Clear
        </button>
      </div>
    </form>

    <!-- Message -->
    <div
      v-if="message"
      :class="[
        'message-leave',
        isSuccess ? 'message-success' : 'message-error',
      ]"
    >
      <span class="message-icon">{{ isSuccess ? "✓" : "✕" }}</span>
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      date: "",
      reason: "",
      message: "",
      isSuccess: false,
      loading: false,
      leaves: [],
      showCalendar: true,
      currentDate: new Date(),
      weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  },
  computed: {
    staffEmail() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.email || "";
    },
    monthYear() {
      return this.currentDate.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    },
    dateHasLeave() {
      return this.leaves.some((leave) => leave.date === this.date);
    },
    calendarDays() {
      const year = this.currentDate.getFullYear();
      const month = this.currentDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const startDate = new Date(firstDay);
      startDate.setDate(startDate.getDate() - firstDay.getDay());

      const days = [];
      let current = new Date(startDate);

      while (days.length < 42) {
        days.push({
          day: current.getDate(),
          date: current.toISOString().split("T")[0],
          isCurrentMonth: current.getMonth() === month,
        });
        current.setDate(current.getDate() + 1);
      }

      return days;
    },
  },
  mounted() {
    if (this.staffEmail) this.fetchLeaves();
  },
  methods: {
    previousMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.currentDate = new Date(this.currentDate);
    },
    nextMonth() {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.currentDate = new Date(this.currentDate);
    },
    selectDate(dateStr) {
      this.date = dateStr;
      this.showCalendar = false;
    },
    async submitLeave() {
      if (!this.staffEmail) {
        this.message = "You must be logged in!";
        this.isSuccess = false;
        return;
      }
      if (!this.date || !this.reason.trim()) {
        this.message = "Please fill all fields.";
        this.isSuccess = false;
        return;
      }

      const leaveExists = this.leaves.some((leave) => leave.date === this.date);
      if (leaveExists) {
        this.message = "You have already applied for leave on this date!";
        this.isSuccess = false;
        return;
      }

      this.loading = true;

      try {
        const res = await fetch("http://localhost:5000/api/leaves/request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: this.staffEmail,
            date: this.date,
            reason: this.reason.trim(),
          }),
        });

        const data = await res.json();

        if (res.ok) {
          this.message = data.message || "Leave request submitted!";
          this.isSuccess = true;
          this.resetForm();
          this.fetchLeaves();
        } else {
          this.message = data.error || "Failed to submit leave";
          this.isSuccess = false;
        }
      } catch (err) {
        console.error(err);
        this.message = "Error submitting leave. Try again later.";
        this.isSuccess = false;
      } finally {
        this.loading = false;
      }
    },
    resetForm() {
      this.date = "";
      this.reason = "";
      this.currentDate = new Date();
      this.showCalendar = true;
    },
    async fetchLeaves() {
      try {
        const res = await fetch(
          `http://localhost:5000/api/leaves/my?email=${this.staffEmail}`
        );
        const data = await res.json();
        this.leaves = data || [];
      } catch (err) {
        console.error("Error fetching leaves:", err);
      }
    },
  },
};
</script>

<style scoped>
.leave-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

/* Header */
.leave-header {
  margin-bottom: 28px;
}

.leave-header h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.leave-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Form */
.leave-form-modern {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group-leave {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label-leave {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Calendar Wrapper */
.calendar-wrapper {
  position: relative;
}

.calendar-container {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 1000;
  margin-top: 8px;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.current-month {
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.nav-btn {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  padding: 8px 0;
}

.dates-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.date-btn {
  padding: 8px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.date-btn:hover:not(:disabled) {
  background: #f0f4ff;
  border-color: #2563eb;
  color: #2563eb;
}

.date-btn.selected {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border-color: #2563eb;
}

.date-btn.other-month {
  color: #cbd5e1;
  cursor: not-allowed;
}

.date-btn.has-leave {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
  cursor: not-allowed;
  opacity: 0.7;
}

.date-btn.has-leave:hover {
  background: #fee2e2;
}

.date-display {
  position: relative;
  display: flex;
  align-items: center;
}

.date-input-modern {
  width: 100%;
  padding: 12px 14px;
  padding-right: 44px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s ease;
  background: white;
  cursor: pointer;
}

.date-input-modern:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.date-input-modern:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

.date-icon {
  position: absolute;
  right: 14px;
  font-size: 18px;
  pointer-events: none;
  color: #2563eb;
}

/* Textarea */
.textarea-modern {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  background: white;
}

.textarea-modern::placeholder {
  color: #94a3b8;
}

.textarea-modern:hover {
  border-color: #cbd5e1;
  background: #f8fafc;
}

.textarea-modern:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  background: white;
}

/* Buttons */
.button-group-leave {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.btn-submit-leave,
.btn-clear-leave {
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-submit-leave {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-submit-leave:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-submit-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-clear-leave {
  background: #e2e8f0;
  color: #64748b;
}

.btn-clear-leave:hover:not(:disabled) {
  background: #cbd5e1;
  color: #1e293b;
  transform: translateY(-2px);
}

.btn-clear-leave:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Message */
.message-leave {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: slideUp 0.3s ease-in-out;
}

.message-icon {
  font-size: 18px;
  font-weight: 700;
}

.message-success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message-error {
  background: #fee2e2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .leave-container {
    padding: 16px;
  }

  .leave-header h2 {
    font-size: 20px;
  }

  .button-group-leave {
    flex-direction: column;
  }

  .btn-submit-leave,
  .btn-clear-leave {
    width: 100%;
  }
}
</style>
