<template>
  <div class="staff-dashboard">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo-disc">CD</div>
        <h2 class="sidebar-title">Staff Portal</h2>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li
            :class="{ active: currentTab === 'dashboard' }"
            @click="currentTab = 'dashboard'"
          >
            <div class="nav-icon-wrapper">
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
            </div>
            <span class="sidebar-text">Dashboard</span>
          </li>
          <li
            :class="{ active: currentTab === 'profile' }"
            @click="currentTab = 'profile'"
          >
            <div class="nav-icon-wrapper">
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
            </div>
            <span class="sidebar-text">Professional Profile</span>
          </li>
          <li
            :class="{ active: currentTab === 'items' }"
            @click="currentTab = 'items'"
          >
            <div class="nav-icon-wrapper">
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
            </div>
            <span class="sidebar-text">Inventory Management</span>
          </li>

          <li
            @click="toggleLeaves"
            class="has-submenu"
            :class="{ 'submenu-open': showLeaves }"
          >
            <div class="nav-icon-wrapper">
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
            </div>
            <span class="sidebar-text">Shift & Leaves</span>
            <span class="arrow">{{ showLeaves ? "▼" : "▶" }}</span>
          </li>
          <transition name="slide">
            <ul v-if="showLeaves" class="submenu">
              <li
                :class="{ active: currentTab === 'apply-leave' }"
                @click.stop="currentTab = 'apply-leave'"
              >
                <span class="dot"></span>
                <span class="sidebar-text">Apply Leave</span>
              </li>
              <li
                :class="{ active: currentTab === 'leave-status' }"
                @click.stop="currentTab = 'leave-status'"
              >
                <span class="dot"></span>
                <span class="sidebar-text">Request History</span>
              </li>
            </ul>
          </transition>

          <li
            :class="{ active: currentTab === 'chat' }"
            @click="currentTab = 'chat'"
            class="message-item"
          >
            <div class="nav-icon-wrapper">
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
              <span v-if="unreadMessageCount > 0" class="message-badge"></span>
            </div>
            <span class="sidebar-text">Team Communications</span>
            <span v-if="unreadMessageCount > 0" class="badge-count">
              {{ unreadMessageCount }}
            </span>
          </li>

          <li
            :class="{ active: currentTab === 'resignation' }"
            @click="currentTab = 'resignation'"
          >
            <div class="nav-icon-wrapper">
              <svg
                class="sidebar-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M15 3h6v18h-6M10 17l5-5-5-5M13.8 12H3" />
              </svg>
            </div>
            <span class="sidebar-text">Career Path</span>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <li @click="logout" class="logout-item">
          <div class="nav-icon-wrapper">
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
          </div>
          <span class="sidebar-text">Sign Out</span>
        </li>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="content">
      <!-- Dashboard Tab -->
      <div v-if="currentTab === 'dashboard'" class="dashboard-tab">
        <!-- Hero Banner -->
        <div class="welcome-section">
          <div class="welcome-text">
            <h1>Spark your productivity, {{ staff.name.split(" ")[0] }}! ✨</h1>
            <p>Your performance cockpit for Cochin Distributors.</p>
          </div>
          <div class="welcome-actions">
            <button class="btn-primary-staff" @click="currentTab = 'items'">
              Quick Inventory Check
            </button>
          </div>
        </div>

        <!-- Modern Metrics Grid -->
        <div class="metrics-grid-staff">
          <div class="metric-card-glass" @click="currentTab = 'items'">
            <div class="glass-icon blue">📦</div>
            <div class="glass-info">
              <span class="glass-label">Active Items</span>
              <h3 class="glass-value">{{ stats.totalItems }}</h3>
            </div>
            <div class="glass-glow blue"></div>
          </div>

          <div
            class="metric-card-glass"
            @click="
              showLeaves = true;
              currentTab = 'leave-status';
            "
          >
            <div class="glass-icon yellow">🏖️</div>
            <div class="glass-info">
              <span class="glass-label">Total Leaves</span>
              <h3 class="glass-value">{{ stats.leavesTaken }}</h3>
            </div>
            <div class="glass-glow yellow"></div>
          </div>

          <div
            class="metric-card-glass"
            @click="
              showLeaves = true;
              currentTab = 'leave-status';
            "
          >
            <div class="glass-icon orange">⏳</div>
            <div class="glass-info">
              <span class="glass-label">Pending</span>
              <h3 class="glass-value">{{ stats.pendingLeaves }}</h3>
            </div>
            <div class="glass-glow orange"></div>
          </div>

          <div
            class="metric-card-glass"
            @click="
              showLeaves = true;
              currentTab = 'leave-status';
            "
          >
            <div class="glass-icon green">✅</div>
            <div class="glass-info">
              <span class="glass-label">Approved</span>
              <h3 class="glass-value">{{ stats.approvedLeaves }}</h3>
            </div>
            <div class="glass-glow green"></div>
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

      <!-- Resignation Tab -->
      <div v-if="currentTab === 'resignation'" class="resignation-tab">
        <h2>Resignation Request</h2>
        <div class="resignation-content">
          <div
            v-if="staff.resignationStatus === 'pending'"
            class="status-box pending"
          >
            <h3>Request Pending</h3>
            <p>
              Your resignation request is currently being reviewed by the admin.
            </p>
            <p>
              Submitted on:
              {{
                staff.resignationDate ? formatDate(staff.resignationDate) : "—"
              }}
            </p>
          </div>

          <div
            v-else-if="staff.resignationStatus === 'approved'"
            class="status-box approved"
          >
            <h3>Resignation Approved</h3>
            <p>Your resignation has been accepted.</p>
            <p>
              <strong>Last Working Day:</strong>
              {{
                staff.lastWorkingDay ? formatDate(staff.lastWorkingDay) : "—"
              }}
            </p>
            <button @click="downloadExperienceCertificate" class="btn-download">
              📄 Download Experience Certificate
            </button>
          </div>

          <div
            v-else-if="staff.resignationStatus === 'rejected'"
            class="status-box rejected"
          >
            <h3>Request Rejected</h3>
            <p>Your resignation request was rejected.</p>
            <button @click="staff.resignationStatus = 'none'" class="btn-retry">
              Apply Again
            </button>
          </div>

          <div v-else class="apply-box">
            <p>
              If you wish to resign, please provide a reason below and submit
              your request.
            </p>
            <textarea
              v-model="resignationReason"
              placeholder="Reason for resignation..."
              class="reason-input"
              rows="4"
            ></textarea>
            <button
              @click="submitResignation"
              class="btn-submit-resignation"
              :disabled="!resignationReason"
            >
              Submit Resignation
            </button>
          </div>
        </div>
      </div>

      <!-- Chat Tab -->
      <div v-if="currentTab === 'chat'" class="chat-tab">
        <ChatWindow />
      </div>
    </main>
  </div>
</template>

<script>
import axios from "@/utils/axios";
import StaffLeave from "./StaffLeave.vue";
import ChatWindow from "./ChatWindow.vue";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
        resignationStatus: "none",
        lastWorkingDay: null,
      },
      resignationReason: "",
      stats: {
        totalItems: 0,
        leavesTaken: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
      },
      leaveStatus: [],
      selectedFile: null,
      message: "",
      apiBase: "",
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
        const res = await axios.get(`/api/staff/me`);
        this.staff = res.data.staff;
      } catch {
        this.message = "Error loading profile";
      }
    },
    async fetchStats() {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        let leavesRes = { data: [] };
        const productsRes = await axios.get(`/api/products/getproduct`);
        if (user && user.email) {
          try {
            leavesRes = await axios.get(`/api/leaves/my`, {
              params: { email: user.email },
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
        const formData = new FormData();
        Object.keys(this.staff).forEach((key) => {
          if (key !== "email") formData.append(key, this.staff[key]);
        });
        if (this.selectedFile)
          formData.append("profilePhoto", this.selectedFile);

        const res = await axios.put(`/api/staff/update`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
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
    async logout() {
      try {
        await axios.post("/api/auth/logout");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.$router.push("/login");
      }
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
    async submitResignation() {
      try {
        const token = localStorage.getItem("token");
        await axios.post(
          `${this.apiBase}/api/staff/resign`,
          { reason: this.resignationReason },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.staff.resignationStatus = "pending";
        this.staff.resignationDate = new Date();
        this.message = "Resignation submitted successfully";
        setTimeout(() => (this.message = ""), 3000);
      } catch (err) {
        this.message =
          err.response?.data?.message || "Error submitting resignation";
      }
    },
    downloadExperienceCertificate() {
      const doc = new jsPDF();
      const logo = new Image();
      logo.src = require("@/assets/logo.jpeg");
      doc.addImage(logo, "JPEG", 34, 13, 30, 25);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("COCHIN DISTRIBUTORS", 75, 18);
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text("Merchant Association Building,", 82, 26);
      doc.text("Santhi Nagar, Kattappana", 87, 32);
      doc.text("Ph: 9447419293, 9446074962", 83, 38);
      doc.setDrawColor(0);
      doc.line(14, 45, 200, 45);

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("Experience Certificate", 105, 60, null, null, "center");

      autoTable(doc, {
        startY: 70,
        theme: "grid",
        body: [
          ["Employee Name", this.staff.name],
          [
            "Date of Joining",
            new Date(this.staff.dateOfJoining).toLocaleDateString(),
          ],
          [
            "Last Working Day",
            new Date(this.staff.lastWorkingDay).toLocaleDateString(),
          ],
          ["Designation", "Staff"],
        ],
      });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const text = `This is to certify that Mr./Ms. ${
        this.staff.name
      } has worked with Cochin Distributors from ${new Date(
        this.staff.dateOfJoining
      ).toLocaleDateString()} to ${new Date(
        this.staff.lastWorkingDay
      ).toLocaleDateString()}.`;

      const splitText = doc.splitTextToSize(text, 180);
      doc.text(splitText, 14, doc.lastAutoTable.finalY + 15);

      doc.text(
        `We wish ${
          this.staff.gender === "female" ? "her" : "him"
        } all the best for future endeavors.`,
        14,
        doc.lastAutoTable.finalY + 30
      );

      doc.text("Sincerely,", 14, doc.lastAutoTable.finalY + 50);
      doc.text("Manager", 14, doc.lastAutoTable.finalY + 60);
      doc.text("Cochin Distributors", 14, doc.lastAutoTable.finalY + 65);

      doc.save(`${this.staff.name}_Experience_Certificate.pdf`);
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

/* Sidebar Redesign */
.sidebar {
  width: 280px;
  background: #0f172a; /* Deeper dark */
  color: #f8fafc;
  padding: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-header {
  padding: 32px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-disc {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: white;
  font-size: 16px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.sidebar-title {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.sidebar-nav {
  flex: 1;
  padding: 0 16px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar li {
  padding: 12px 16px;
  margin-bottom: 4px;
  cursor: pointer;
  border-radius: 12px;
  transition: all 0.2s ease;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-icon-wrapper {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-icon {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  stroke-width: 2;
  transition: all 0.2s ease;
}

.sidebar li:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}

.sidebar li:hover .nav-icon-wrapper {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar li.active {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  font-weight: 600;
}

.sidebar li.active .nav-icon-wrapper {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.sidebar-text {
  font-size: 14px;
}

/* Submenu Styles */
.submenu {
  margin: 4px 0 12px 28px;
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  padding-left: 12px !important;
}

.submenu li {
  padding: 8px 12px;
  font-size: 13px;
  gap: 8px;
}

.dot {
  width: 4px;
  height: 4px;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.4;
}

.message-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid #0f172a;
}

.badge-count {
  margin-left: auto;
  background: #ef4444;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  font-weight: 700;
}

.sidebar-footer {
  padding: 24px 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.logout-item {
  color: #ef4444 !important;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.1) !important;
}

/* Content Area Redesign */
.content {
  flex: 1;
  background: #f1f5f9;
  padding: 40px;
  overflow-y: auto;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 40px;
}

.welcome-text h1 {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 8px 0;
  letter-spacing: -1px;
}

.welcome-text p {
  color: #64748b;
  margin: 0;
  font-size: 16px;
}

.btn-primary-staff {
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary-staff:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* Glass Metrics */
.metrics-grid-staff {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.metric-card-glass {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 24px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.metric-card-glass:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.9);
}

.glass-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 1;
}

.glass-icon.blue {
  background: #eff6ff;
  color: #3b82f6;
}
.glass-icon.yellow {
  background: #fffbeb;
  color: #f59e0b;
}
.glass-icon.orange {
  background: #fff7ed;
  color: #f97316;
}
.glass-icon.green {
  background: #f0fdf4;
  color: #22c55e;
}

.glass-info {
  display: flex;
  flex-direction: column;
  z-index: 1;
}

.glass-label {
  font-size: 12px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.glass-value {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  margin: 4px 0 0 0;
  letter-spacing: -1px;
}

.glass-glow {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.15;
  transition: all 0.3s ease;
}

.glass-glow.blue {
  background: #3b82f6;
}
.glass-glow.yellow {
  background: #f59e0b;
}
.glass-glow.orange {
  background: #f97316;
}
.glass-glow.green {
  background: #22c55e;
}

.metric-card-glass:hover .glass-glow {
  opacity: 0.3;
  transform: scale(1.2);
}

/* Profile Tab */
.profile-tab {
  padding: 20px;
}

/* Leave Table Redesign */
.leave-status-tab {
  background: white;
  padding: 32px;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
}

.leave-status-tab h2 {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.leave-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 8px;
  margin-top: 15px;
}

.leave-table th {
  padding: 12px 20px;
  text-align: left;
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.leave-table td {
  padding: 16px 20px;
  background: #f8fafc;
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}

.leave-table tr td:first-child {
  border-radius: 12px 0 0 12px;
}

.leave-table tr td:last-child {
  border-radius: 0 12px 12px 0;
}

.leave-table tr:hover td {
  background: #f1f5f9;
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
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  animation: fadeIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.profile-modal-container {
  background: white;
  border-radius: 32px;
  width: 90%;
  max-width: 440px;
  box-shadow: 0 40px 100px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
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
    transform: translateY(60px) scale(0.95);
    opacity: 0;
  }
  to {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

/* Profile View Card */
.profile-view-card {
  padding: 40px;
  text-align: center;
  position: relative;
}

.profile-photo-section {
  margin-bottom: 24px;
  position: relative;
  display: inline-block;
}

.profile-photo-large {
  width: 120px;
  height: 120px;
  border-radius: 40px;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  background: #f1f5f9;
}

.profile-name {
  font-size: 26px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 24px;
  letter-spacing: -0.5px;
}

.profile-info-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

.profile-info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  transition: all 0.3s ease;
}

.profile-info-item:hover {
  background: #fff;
  border-color: #e2e8f0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}

.profile-info-icon {
  font-size: 20px;
  width: 40px;
  height: 40px;
  background: #fff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

.profile-info-content {
  flex: 1;
  text-align: left;
}

.profile-info-label {
  font-size: 11px;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 1px;
  display: block;
  margin-bottom: 2px;
}

.profile-info-value {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
}

.btn-edit-profile {
  width: 100%;
  padding: 16px;
  background: #0f172a;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-edit-profile:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.btn-close-modal {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  background: #f8fafc;
  border: none;
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  transition: all 0.2s ease;
}

.btn-close-modal:hover {
  color: #ef4444;
  background: #fef2f2;
}

/* Profile Edit Card */
.profile-edit-card {
  padding: 40px;
}

.profile-edit-card h3 {
  margin: 0 0 24px 0;
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  text-align: center;
  letter-spacing: -0.5px;
}

.edit-photo-section {
  text-align: center;
  margin-bottom: 28px;
}

.profile-photo-edit {
  width: 110px;
  height: 110px;
  border-radius: 36px;
  object-fit: cover;
  margin-bottom: 16px;
  border: 4px solid #fff;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.file-input {
  display: block;
  margin: 0 auto;
  font-size: 12px;
  color: #64748b;
}

.profile-edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  padding-left: 4px;
}

.form-group input,
.form-group select {
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  font-size: 14px;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.form-group input:disabled {
  background: #f1f5f9;
  color: #94a3b8;
  cursor: not-allowed;
  border-style: dashed;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-save,
.btn-cancel {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-save {
  background: #0f172a;
  color: white;
}

.btn-save:hover {
  background: #1e293b;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
  color: #1e293b;
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

/* Resignation Tab Redesign */
.resignation-tab {
  padding: 40px;
  background: white;
  border-radius: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
  max-width: 850px;
  margin: 0 auto;
  border: 1px solid #e2e8f0;
}

.resignation-tab h2 {
  color: #1e293b;
  font-size: 24px;
  margin-bottom: 28px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.resignation-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.status-box {
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s ease;
}

.status-box h3 {
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 12px;
}

.status-box p {
  font-size: 15px;
  line-height: 1.6;
  margin-bottom: 8px;
}

.status-box.pending {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
}

.status-box.approved {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
}

.status-box.rejected {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
}

.reason-input {
  width: 100%;
  padding: 20px;
  border-radius: 16px;
  border: 1.5px solid #e2e8f0;
  background: #f8fafc;
  font-family: inherit;
  font-size: 15px;
  resize: none;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.reason-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
}

.btn-submit-resignation {
  width: 100%;
  padding: 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
}

.btn-submit-resignation:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(239, 68, 68, 0.2);
}

.btn-submit-resignation:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-download {
  margin-top: 20px;
  background: #0f172a;
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-download:hover {
  background: #1e293b;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .sidebar {
    width: 80px;
    padding: 24px 12px;
  }
  .sidebar-text,
  .sidebar-title,
  .arrow,
  .nav-icon-wrapper + span {
    display: none;
  }
  .content {
    padding: 20px;
  }
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
  .metrics-grid-staff {
    grid-template-columns: 1fr;
  }
}
</style>
