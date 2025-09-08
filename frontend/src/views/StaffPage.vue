<template>
  <div class="staff-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2 class="sidebar-title">Staff Panel</h2>
      <ul>
        <li
          :class="{ active: currentTab === 'dashboard' }"
          @click="currentTab = 'dashboard'"
        >
          Dashboard
        </li>
        <li
          :class="{ active: currentTab === 'profile' }"
          @click="currentTab = 'profile'"
        >
          Profile
        </li>
        <li
          :class="{ active: currentTab === 'items' }"
          @click="currentTab = 'items'"
        >
          Manage Items
        </li>

        <li @click="toggleLeaves" class="has-submenu">
          Leaves <span class="arrow">{{ showLeaves ? "▼" : "▶" }}</span>
        </li>
        <ul v-if="showLeaves" class="submenu">
          <li
            :class="{ active: currentTab === 'apply-leave' }"
            @click.stop="currentTab = 'apply-leave'"
          >
            Apply for Leave
          </li>
          <li
            :class="{ active: currentTab === 'leave-status' }"
            @click.stop="currentTab = 'leave-status'"
          >
            Leave Status
          </li>
        </ul>

        <li @click="logout">Logout</li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Dashboard Tab -->
      <div v-if="currentTab === 'dashboard'" class="dashboard-tab">
        <h2>Dashboard</h2>
        <div class="stats-grid">
          <div class="stat-box total-items">
            Total Items: {{ stats.totalItems }}
          </div>
          <div class="stat-box leaves-taken">
            Leaves Taken: {{ stats.leavesTaken }}
          </div>
          <div class="stat-box pending-tasks">
            Pending Tasks: {{ stats.pendingTasks }}
          </div>
          <div class="stat-box completed-tasks">
            Completed Tasks: {{ stats.completedTasks }}
          </div>
        </div>
      </div>

      <!-- Profile Tab -->
      <div v-if="currentTab === 'profile'" class="profile-tab">
        <h2>My Profile</h2>
        <div class="profile-card">
          <div class="photo-section">
            <img
              :src="
                staff.profilePhoto ? apiBase + staff.profilePhoto : defaultPhoto
              "
              alt="Profile Photo"
              class="profile-photo"
            />
            <input type="file" @change="onFileChange" />
          </div>
          <form @submit.prevent="updateProfile" class="profile-form">
            <label>Name</label>
            <input v-model="staff.name" required />
            <label>Email (cannot be changed)</label>
            <input v-model="staff.email" disabled />
            <label>Phone</label>
            <input v-model="staff.phone" required />
            <label>Gender</label>
            <select v-model="staff.gender">
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <label>Address</label>
            <input v-model="staff.address" required />
            <label>Pincode</label>
            <input v-model="staff.pincode" required />
            <button type="submit">Update Profile</button>
          </form>
        </div>
        <p v-if="message" class="message">{{ message }}</p>
      </div>

      <!-- Manage Items Tab -->
      <div v-if="currentTab === 'items'" class="items-tab">
        <h2>Manage Items</h2>
        <p>👉 Here you can add, update, or delete items.</p>
      </div>

      <!-- Apply Leave Tab -->
      <div v-if="currentTab === 'apply-leave'" class="apply-leave-tab">
        <StaffLeave @leave-submitted="fetchLeaveStatus" />
      </div>

      <!-- Leave Status Tab -->
      <div v-if="currentTab === 'leave-status'" class="leave-status-tab">
        <h2>Leave Status</h2>
        <table class="leave-table">
          <thead>
            <tr>
              <th>Reason</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="leave in leaveStatus" :key="leave._id">
              <td>{{ leave.reason }}</td>
              <td>{{ formatDate(leave.date) }}</td>
              <td>{{ leave.status }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import StaffLeave from "./StaffLeave.vue";

export default {
  components: { StaffLeave },
  data() {
    return {
      currentTab: "dashboard",
      showLeaves: false,
      staff: {
        name: "",
        email: "",
        phone: "",
        gender: "",
        address: "",
        pincode: "",
        profilePhoto: "",
      },
      stats: {
        totalItems: 0,
        leavesTaken: 0,
        pendingTasks: 0,
        completedTasks: 0,
      },
      leaveStatus: [],
      selectedFile: null,
      message: "",
      apiBase: "http://localhost:5000",
      defaultPhoto: "/default-avatar.png",
    };
  },
  methods: {
    async fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${this.apiBase}/api/staff/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.staff = res.data.staff;
      } catch {
        this.message = "Error loading profile";
      }
    },
    async fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${this.apiBase}/api/staff/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.stats = res.data;
      } catch (err) {
        console.error("Error fetching stats", err);
      }
    },
    onFileChange(e) {
      this.selectedFile = e.target.files[0];
    },
    async updateProfile() {
      try {
        const token = localStorage.getItem("token");
        const formData = new FormData();
        Object.keys(this.staff).forEach((key) => {
          if (key !== "email") formData.append(key, this.staff[key]);
        });
        if (this.selectedFile)
          formData.append("profilePhoto", this.selectedFile);

        const res = await axios.put(
          `${this.apiBase}/api/staff/update`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.message = res.data.message;
        this.fetchProfile();
      } catch (err) {
        this.message = err.response?.data?.message || "Error updating profile";
      }
    },
    toggleLeaves() {
      this.showLeaves = !this.showLeaves;
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    async fetchLeaveStatus() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user?.email;
        if (!email) return;

        const token = localStorage.getItem("token");
        const res = await axios.get(`${this.apiBase}/api/leaves/my`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { email },
        });

        this.leaveStatus = res.data;
      } catch (err) {
        console.error("Error fetching leave status", err);
      }
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleDateString();
    },
  },
  watch: {
    currentTab(newTab) {
      if (newTab === "leave-status") this.fetchLeaveStatus();
    },
  },
  mounted() {
    this.fetchProfile();
    this.fetchStats();
  },
};
</script>

<style scoped>
.staff-dashboard {
  display: flex;
  min-height: 100vh;
}

/* Sidebar */
.sidebar {
  width: 220px;
  background: #2c3e50;
  color: white;
  padding: 20px;
}
.sidebar-title {
  font-size: 18px;
  margin-bottom: 20px;
}
.sidebar ul {
  list-style: none;
  padding: 0;
}
.sidebar li {
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.3s;
}
.sidebar li:hover,
.sidebar li.active {
  background: #34495e;
}
.has-submenu {
  font-weight: bold;
}
.arrow {
  float: right;
}
.submenu {
  margin-left: 15px;
}
.submenu li {
  padding: 8px 10px;
  background: #3b4a5a;
  border-radius: 4px;
  margin: 4px 0;
}
.submenu li.active {
  background: #1abc9c;
}

/* Content Area */
.content {
  flex: 1;
  padding: 20px;
  background: #f4f6f9;
}

/* Dashboard Boxes */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}
.stat-box {
  padding: 20px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
.total-items {
  background: #3498db;
}
.leaves-taken {
  background: #e74c3c;
}
.pending-tasks {
  background: #f39c12;
}
.completed-tasks {
  background: #2ecc71;
}

/* Profile Card */
.profile-card {
  display: flex;
  gap: 20px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
}
.photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.profile-photo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 10px;
}
.profile-form {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.profile-form label {
  grid-column: span 2;
  font-weight: bold;
}
.profile-form input,
.profile-form select,
.profile-form textarea {
  grid-column: span 2;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #ccc;
}
button {
  grid-column: span 2;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
}

/* Leave Table */
.leave-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.leave-table th,
.leave-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: center;
}
.leave-table th {
  background: #34495e;
  color: white;
}
</style>
