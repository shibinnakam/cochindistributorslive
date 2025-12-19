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
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          <span class="sidebar-text">Dashboard</span>
        </li>
        <li
          :class="{ active: currentTab === 'profile' }"
          @click="currentTab = 'profile'"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span class="sidebar-text">Profile</span>
        </li>
        <li
          :class="{ active: currentTab === 'items' }"
          @click="currentTab = 'items'"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="9" y1="2" x2="9" y2="22"></line>
            <line x1="15" y1="2" x2="15" y2="22"></line>
            <line x1="3" y1="4" x2="21" y2="4"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
            <line x1="3" y1="16" x2="21" y2="16"></line>
          </svg>
          <span class="sidebar-text">Manage Items</span>
        </li>

        <li @click="toggleLeaves" class="has-submenu">
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
            ></path>
            <polyline points="13 2 13 9 20 9"></polyline>
            <line x1="9" y1="13" x2="15" y2="13"></line>
            <line x1="9" y1="17" x2="15" y2="17"></line>
          </svg>
          <span class="sidebar-text">Leaves</span>
          <span class="arrow">{{ showLeaves ? "▼" : "▶" }}</span>
        </li>
        <ul v-if="showLeaves" class="submenu">
          <li
            :class="{ active: currentTab === 'apply-leave' }"
            @click.stop="currentTab = 'apply-leave'"
          >
            <svg
              class="sidebar-icon submenu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              ></path>
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              ></path>
            </svg>
            <span class="sidebar-text">Apply for Leave</span>
          </li>
          <li
            :class="{ active: currentTab === 'leave-status' }"
            @click.stop="currentTab = 'leave-status'"
          >
            <svg
              class="sidebar-icon submenu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="sidebar-text">Leave Status</span>
          </li>
        </ul>

        <li
          :class="{ active: currentTab === 'chat' }"
          @click="currentTab = 'chat'"
          class="message-item"
        >
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            ></path>
          </svg>
          <span class="sidebar-text">Messages</span>
          <span v-if="unreadMessageCount > 0" class="message-badge">{{
            unreadMessageCount
          }}</span>
        </li>

        <li @click="logout">
          <svg
            class="sidebar-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span class="sidebar-text">Logout</span>
        </li>
      </ul>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Dashboard Tab -->
      <div v-if="currentTab === 'dashboard'" class="dashboard-tab">
        <!-- Hero Banner -->
        <div class="hero-banner-staff">
          <div class="hero-content-staff">
            <h2>Welcome to Your Dashboard</h2>
            <p>Track your tasks, leaves, and performance</p>
          </div>
        </div>

        <!-- Modern Metrics Grid -->
        <div class="metrics-grid-staff">
          <div class="metric-card-staff">
            <div class="metric-icon-staff items-icon-staff">📦</div>
            <div class="metric-body-staff">
              <div class="metric-title-staff">Total Items</div>
              <div class="metric-number-staff">{{ stats.totalItems }}</div>
              <div class="metric-footer-staff">
                <span class="trend-staff positive">↑ 8.2%</span>
              </div>
            </div>
          </div>

          <div class="metric-card-staff">
            <div class="metric-icon-staff leaves-icon-staff">🏖️</div>
            <div class="metric-body-staff">
              <div class="metric-title-staff">Leaves Taken</div>
              <div class="metric-number-staff">{{ stats.leavesTaken }}</div>
              <div class="metric-footer-staff">
                <span class="trend-staff positive">↓ 2.1%</span>
              </div>
            </div>
          </div>

          <div class="metric-card-staff">
            <div class="metric-icon-staff pending-icon-staff">⏳</div>
            <div class="metric-body-staff">
              <div class="metric-title-staff">Pending Leaves</div>
              <div class="metric-number-staff">{{ stats.pendingLeaves }}</div>
              <div class="metric-footer-staff">
                <span class="trend-staff positive">↑ 5.3%</span>
              </div>
            </div>
          </div>

          <div class="metric-card-staff">
            <div class="metric-icon-staff completed-icon-staff">✅</div>
            <div class="metric-body-staff">
              <div class="metric-title-staff">Approved Leaves</div>
              <div class="metric-number-staff">{{ stats.approvedLeaves }}</div>
              <div class="metric-footer-staff">
                <span class="trend-staff positive">↑ 12.5%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Profile Tab (hidden, modal opens automatically) -->
      <div v-if="currentTab === 'profile'" class="profile-tab">
        <p v-if="message" class="message">{{ message }}</p>
      </div>

      <!-- Modern Profile Modal -->
      <div
        v-if="showProfileModal"
        class="profile-modal-overlay"
        @click="closeProfileModal"
      >
        <div class="profile-modal-container" @click.stop>
          <!-- View Profile Card -->
          <div v-if="!showEditProfile" class="profile-view-card">
            <!-- Profile Photo -->
            <div class="profile-photo-section">
              <img
                :src="
                  staff.profilePhoto
                    ? apiBase + staff.profilePhoto
                    : defaultPhoto
                "
                alt="Profile Photo"
                class="profile-photo-large"
              />
            </div>

            <!-- Profile Name -->
            <div class="profile-name">{{ staff.name || "—" }}</div>

            <!-- Profile Information Items -->
            <div class="profile-info-container">
              <div class="profile-info-item">
                <span class="profile-info-icon">👤</span>
                <div class="profile-info-content">
                  <span class="profile-info-label">Gender</span>
                  <span class="profile-info-value">{{
                    staff.gender || "—"
                  }}</span>
                </div>
              </div>

              <div class="profile-info-item">
                <span class="profile-info-icon">📱</span>
                <div class="profile-info-content">
                  <span class="profile-info-label">Phone</span>
                  <span class="profile-info-value">{{
                    staff.phone || "—"
                  }}</span>
                </div>
              </div>

              <div class="profile-info-item">
                <span class="profile-info-icon">✉️</span>
                <div class="profile-info-content">
                  <span class="profile-info-label">Email</span>
                  <span class="profile-info-value">{{
                    staff.email || "—"
                  }}</span>
                </div>
              </div>

              <div class="profile-info-item">
                <span class="profile-info-icon">📍</span>
                <div class="profile-info-content">
                  <span class="profile-info-label">Address</span>
                  <span class="profile-info-value">{{
                    staff.address || "—"
                  }}</span>
                </div>
              </div>

              <div class="profile-info-item">
                <span class="profile-info-icon">📮</span>
                <div class="profile-info-content">
                  <span class="profile-info-label">Pincode</span>
                  <span class="profile-info-value">{{
                    staff.pincode || "—"
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Edit Profile Button -->
            <button @click="showEditProfile = true" class="btn-edit-profile">
              ✏️ Edit Profile
            </button>

            <!-- Close Button -->
            <button @click="closeProfileModal" class="btn-close-modal">
              ✕
            </button>
          </div>

          <!-- Edit Profile Form -->
          <div v-else class="profile-edit-card">
            <h3>Edit Your Profile</h3>
            <div class="edit-photo-section">
              <img
                :src="
                  staff.profilePhoto
                    ? apiBase + staff.profilePhoto
                    : defaultPhoto
                "
                alt="Profile Photo"
                class="profile-photo-edit"
              />
              <input type="file" @change="onFileChange" class="file-input" />
            </div>

            <form @submit.prevent="updateProfile" class="profile-edit-form">
              <div class="form-group">
                <label>Name</label>
                <input v-model="staff.name" required />
              </div>

              <div class="form-group">
                <label>Email (cannot be changed)</label>
                <input v-model="staff.email" disabled />
              </div>

              <div class="form-group">
                <label>Phone</label>
                <input v-model="staff.phone" required />
              </div>

              <div class="form-group">
                <label>Gender</label>
                <select v-model="staff.gender">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div class="form-group">
                <label>Address</label>
                <input v-model="staff.address" required />
              </div>

              <div class="form-group">
                <label>Pincode</label>
                <input v-model="staff.pincode" required />
              </div>

              <div class="form-actions">
                <button type="submit" class="btn-save">💾 Save Changes</button>
                <button
                  type="button"
                  @click="showEditProfile = false"
                  class="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
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

      <!-- Chat Tab -->
      <div v-if="currentTab === 'chat'" class="chat-tab">
        <ChatWindow />
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import StaffLeave from "./StaffLeave.vue";
import ChatWindow from "./ChatWindow.vue";

export default {
  components: { StaffLeave, ChatWindow },
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
        pendingLeaves: 0,
        approvedLeaves: 0,
      },
      leaveStatus: [],
      selectedFile: null,
      message: "",
      apiBase: "http://localhost:5000",
      defaultPhoto: "/default-avatar.png",
      showProfileModal: false,
      showEditProfile: false,
      unreadMessageCount: 0,
      messageInterval: null,
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
        const user = JSON.parse(localStorage.getItem("user"));
        const email = user?.email;

        const productsRes = await axios.get(
          `${this.apiBase}/api/products/getproduct`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        let leavesRes = [];
        if (email) {
          try {
            leavesRes = await axios.get(`${this.apiBase}/api/leaves/my`, {
              headers: { Authorization: `Bearer ${token}` },
              params: { email },
            });
          } catch (err) {
            console.error("Error fetching leaves:", err);
            leavesRes = [];
          }
        }

        const products = productsRes.data.products || [];
        const leaves = Array.isArray(leavesRes)
          ? leavesRes
          : leavesRes.data || [];

        this.stats = {
          totalItems: products.length,
          leavesTaken: leaves.filter((l) => l.status === "Approved").length,
          pendingLeaves: leaves.filter((l) => l.status === "Pending").length,
          approvedLeaves: leaves.filter((l) => l.status === "Approved").length,
        };
      } catch (err) {
        console.error("Error fetching stats:", err);
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
        this.showEditProfile = false;
        setTimeout(() => {
          this.message = "";
        }, 3000);
      } catch (err) {
        this.message = err.response?.data?.message || "Error updating profile";
        setTimeout(() => {
          this.message = "";
        }, 3000);
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
    closeProfileModal() {
      this.showProfileModal = false;
      this.showEditProfile = false;
      this.currentTab = "dashboard";
    },
    async fetchUnreadMessages() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:5000/api/messages/unread-count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          this.unreadMessageCount = res.data.unreadCount;
        }
      } catch (err) {
        console.error("Error fetching unread messages:", err);
      }
    },
  },
  beforeUnmount() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  },
  watch: {
    currentTab(newTab) {
      if (newTab === "leave-status") this.fetchLeaveStatus();
      if (newTab === "profile") this.showProfileModal = true;
    },
  },
  mounted() {
    this.fetchProfile();
    this.fetchStats();
    this.fetchUnreadMessages();
    this.messageInterval = setInterval(() => {
      this.fetchUnreadMessages();
    }, 3000);
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
  width: 260px;
  background: #1e293b;
  color: white;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.sidebar-title {
  text-align: center;
  font-size: 16px;
  margin: 0;
  padding: 24px 20px;
  font-weight: 700;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #3b82f6;
}

.sidebar ul {
  list-style: none;
  padding: 12px 0;
  flex: 1;
}

.sidebar li {
  padding: 12px 20px;
  cursor: pointer;
  border-radius: 0;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  position: relative;
  font-size: 14px;
  font-weight: 500;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-icon {
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.3s ease;
  color: #94a3b8;
  stroke: currentColor;
}

.sidebar li:hover .sidebar-icon {
  opacity: 0.9;
  color: white;
}

.sidebar li.active .sidebar-icon {
  opacity: 1;
  color: #3b82f6;
}

.sidebar-text {
  flex: 1;
}

.message-item {
  position: relative;
}

.message-badge {
  position: absolute;
  right: 16px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.sidebar li:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border-left-color: #3b82f6;
}

.sidebar li.active {
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-left-color: #3b82f6;
  font-weight: 600;
}

.has-submenu {
  font-weight: 600;
}

.arrow {
  font-size: 12px;
  margin-left: auto;
  flex-shrink: 0;
}

.submenu {
  margin-left: 0;
  padding: 8px 0;
  background: rgba(59, 130, 246, 0.05);
}

.submenu li {
  padding: 10px 20px;
  background: transparent;
  border-radius: 0;
  margin: 0;
  font-size: 13px;
  color: #cbd5e1;
  border-left: 3px solid transparent;
  display: flex;
  align-items: center;
  gap: 12px;
}

.submenu-icon {
  font-size: 14px !important;
  width: 18px !important;
  height: 18px !important;
  opacity: 0.5;
  color: #cbd5e1;
}

.submenu li:hover .submenu-icon {
  opacity: 0.8;
  color: #e0e7ff;
}

.submenu li.active .submenu-icon {
  opacity: 1;
  color: #3b82f6;
}

.submenu li:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #e0e7ff;
  border-left-color: #3b82f6;
}

.submenu li.active {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border-left-color: #3b82f6;
  font-weight: 600;
}

/* Content Area */
.content {
  flex: 1;
  padding: 28px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: block;
  overflow-y: auto;
}

/* Modern Staff Dashboard */

.hero-banner-staff {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 50%, #1e3a8a 100%);
  border-radius: 16px;
  padding: 40px 32px;
  margin-bottom: 32px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.15);
}

.hero-banner-staff::before {
  content: "";
  position: absolute;
  top: -50%;
  right: -10%;
  width: 300px;
  height: 300px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float-staff 6s ease-in-out infinite;
}

@keyframes float-staff {
  0%,
  100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-20px) translateX(-10px);
  }
}

.hero-content-staff {
  position: relative;
  z-index: 1;
}

.hero-banner-staff h2 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.hero-banner-staff p {
  margin: 0;
  font-size: 16px;
  opacity: 0.95;
  font-weight: 400;
}

/* Metrics Grid Staff */
.metrics-grid-staff {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.metric-card-staff {
  background: white;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  cursor: pointer;
}

.metric-card-staff:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.metric-icon-staff {
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 12px;
  flex-shrink: 0;
}

.items-icon-staff {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
}

.leaves-icon-staff {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
}

.pending-icon-staff {
  background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
}

.completed-icon-staff {
  background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
}

.metric-body-staff {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.metric-title-staff {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.metric-number-staff {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 8px;
}

.metric-footer-staff {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trend-staff {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  display: inline-block;
}

.trend-staff.positive {
  color: #059669;
  background: #d1fae5;
}

/* Profile Tab */
.profile-tab {
  padding: 20px;
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

/* Responsive Metrics Grid Staff */
@media (max-width: 1440px) {
  .metrics-grid-staff {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .metrics-grid-staff {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .metric-card-staff {
    padding: 20px;
  }

  .metric-number-staff {
    font-size: 24px;
  }

  .hero-banner-staff {
    padding: 32px 24px;
    margin-bottom: 24px;
  }

  .hero-banner-staff h2 {
    font-size: 28px;
  }

  .hero-banner-staff p {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .metrics-grid-staff {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .metric-card-staff {
    padding: 16px;
    gap: 12px;
  }

  .metric-icon-staff {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .metric-number-staff {
    font-size: 20px;
  }

  .metric-title-staff {
    font-size: 11px;
  }

  .hero-banner-staff {
    padding: 24px 16px;
    margin-bottom: 16px;
    border-radius: 12px;
  }

  .hero-banner-staff h2 {
    font-size: 24px;
  }

  .hero-banner-staff p {
    font-size: 13px;
  }
}

/* Modern Profile Modal Styles */
.profile-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease-in-out;
}

.profile-modal-container {
  background: white;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-in-out;
  position: relative;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Profile View Card */
.profile-view-card {
  padding: 30px 20px;
  text-align: center;
  position: relative;
}

.profile-photo-section {
  margin-bottom: 20px;
}

.profile-photo-large {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 24px;
}

.profile-info-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.profile-info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.profile-info-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateX(4px);
}

.profile-info-icon {
  font-size: 20px;
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info-content {
  flex: 1;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.profile-info-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.profile-info-value {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.btn-edit-profile {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-edit-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-close-modal {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  padding: 0;
}

.btn-close-modal:hover {
  color: #1e293b;
  background: #f1f5f9;
  border-radius: 8px;
}

/* Profile Edit Card */
.profile-edit-card {
  padding: 30px 20px;
}

.profile-edit-card h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
}

.edit-photo-section {
  text-align: center;
  margin-bottom: 24px;
}

.profile-photo-edit {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 12px;
  border: 4px solid #2563eb;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.file-input {
  display: block;
  margin: 0 auto;
  font-size: 12px;
}

.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.btn-cancel {
  background: #e2e8f0;
  color: #64748b;
}

.btn-cancel:hover {
  background: #cbd5e1;
}

.btn-view-profile {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.btn-view-profile:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

@media (max-width: 768px) {
  .profile-modal-container {
    max-width: 95%;
  }

  .profile-view-card {
    padding: 20px 16px;
  }

  .profile-photo-large {
    width: 80px;
    height: 80px;
  }

  .profile-name {
    font-size: 20px;
  }

  .profile-info-item {
    padding: 12px 14px;
    gap: 12px;
  }

  .profile-info-icon {
    font-size: 18px;
    width: 28px;
  }
}

.chat-tab {
  padding: 24px;
  height: 100%;
}

.chat-tab > div {
  height: 600px;
}
</style>
