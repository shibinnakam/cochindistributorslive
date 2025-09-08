<template>
  <div class="leave-container">
    <h2>Apply for Leave</h2>
    <form @submit.prevent="submitLeave" class="leave-form">
      <label for="leave-date">Date</label>
      <input id="leave-date" type="date" v-model="date" required />

      <label for="leave-reason">Reason</label>
      <textarea
        id="leave-reason"
        v-model="reason"
        placeholder="Enter your reason"
        required
      ></textarea>

      <div class="buttons">
        <button type="submit" :disabled="loading">
          {{ loading ? "Submitting..." : "Request Leave" }}
        </button>
        <button type="button" @click="resetForm" :disabled="loading">
          Clear
        </button>
      </div>
    </form>

    <p v-if="message" :class="{ success: isSuccess, error: !isSuccess }">
      {{ message }}
    </p>
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
    };
  },
  computed: {
    staffEmail() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.email || "";
    },
  },
  mounted() {
    if (this.staffEmail) this.fetchLeaves();
  },
  methods: {
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
          this.fetchLeaves(); // update history
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
  max-width: 500px;
  margin: auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.leave-form {
  display: grid;
  gap: 15px;
}

.leave-form label {
  font-weight: bold;
}

.leave-form input,
.leave-form textarea {
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
  width: 100%;
  box-sizing: border-box;
}

.leave-form textarea {
  min-height: 80px;
  resize: vertical;
}

.buttons {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 15px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  color: #fff;
}

button[type="submit"] {
  background-color: #3498db;
}

button[type="submit"]:hover {
  background-color: #2980b9;
}

button[type="button"] {
  background-color: #95a5a6;
}

button[type="button"]:hover {
  background-color: #7f8c8d;
}

.success {
  color: #27ae60;
  margin-top: 10px;
}

.error {
  color: #c0392b;
  margin-top: 10px;
}
</style>
