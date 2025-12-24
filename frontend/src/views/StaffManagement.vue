<template>
  <div class="staff-management">
    <!-- Top Header -->
    <div class="top-header">
      <h1>COMPANY EMPLOYEES</h1>
    </div>

    <!-- Metrics Cards -->
    <div class="metrics-section">
      <div
        class="metric-card"
        @click="statusFilter = ''"
        style="cursor: pointer"
      >
        <div class="metric-content">
          <div class="metric-number">{{ stats.total }}</div>
          <div class="metric-label">Total Employees</div>
        </div>
        <div class="metric-progress">
          <div class="progress-bar" :style="{ width: '100%' }"></div>
        </div>
      </div>

      <div
        class="metric-card"
        @click="statusFilter = 'pending'"
        style="cursor: pointer"
      >
        <div class="metric-content">
          <div class="metric-number">{{ stats.pending }}</div>
          <div class="metric-label">Pending Approvals</div>
        </div>
        <div class="metric-progress">
          <div
            class="progress-bar pending-bar"
            :style="{ width: (stats.pending / stats.total) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <div
        class="metric-card"
        @click="statusFilter = 'resignation_pending'"
        style="cursor: pointer"
      >
        <div class="metric-content">
          <div class="metric-number">{{ stats.resignation }}</div>
          <div class="metric-label">Resignation Requests</div>
        </div>
        <div class="metric-progress">
          <div
            class="progress-bar resignation-bar"
            :style="{ width: (stats.resignation / stats.total) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <div
        class="metric-card"
        @click="statusFilter = 'active'"
        style="cursor: pointer"
      >
        <div class="metric-content">
          <div class="metric-number">{{ stats.active }}</div>
          <div class="metric-label">Active Employees</div>
        </div>
        <div class="metric-progress">
          <div
            class="progress-bar active-bar"
            :style="{ width: (stats.active / stats.total) * 100 + '%' }"
          ></div>
        </div>
      </div>

      <div
        class="metric-card"
        @click="statusFilter = 'deactivated'"
        style="cursor: pointer"
      >
        <div class="metric-content">
          <div class="metric-number">{{ stats.deactivated }}</div>
          <div class="metric-label">Deactivated</div>
        </div>
        <div class="metric-progress">
          <div
            class="progress-bar deactivated-bar"
            :style="{ width: (stats.deactivated / stats.total) * 100 + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Charts Section Removed -->

    <!-- Header Section -->
    <div class="header-section">
      <div class="header-controls">
        <div class="search-filter">
          <div class="search-box">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search Employee"
              class="search-input"
            />
            <i class="search-icon">🔍</i>
          </div>
          <select v-model="statusFilter" class="status-filter">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="deactivated">Deactivated</option>
            <option value="resignation_pending">Resignation Requests</option>
          </select>
        </div>
        <div class="action-buttons-header">
          <button @click="showInviteForm = true" class="btn-add">
            + Add Employees
          </button>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div
      v-if="showInviteForm"
      class="modal-overlay"
      @click="showInviteForm = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Invite Employee</h2>
          <button class="modal-close" @click="showInviteForm = false">✕</button>
        </div>
        <form @submit.prevent="inviteStaff" class="invite-form-modal">
          <input
            v-model="email"
            type="email"
            placeholder="Enter staff email"
            required
          />
          <button type="submit" class="btn-submit">Send Invitation</button>
        </form>
      </div>
    </div>

    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      :class="['toast', toastError ? 'error' : 'success']"
    >
      {{ toastMessage }}
    </div>

    <!-- Staff Table -->
    <div class="table-container">
      <table class="staff-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Position</th>
            <th>Salary</th>
            <th>Contact</th>
            <th>Requests</th>
            <th>Hire Date</th>
            <th>Resign Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(s, index) in filteredStaff" :key="s._id">
            <td class="id-cell">{{ index + 1 }}</td>
            <td class="name-cell">
              <div class="employee-info">
                <div class="employee-avatar">
                  {{ s.name ? s.name.charAt(0).toUpperCase() : "?" }}
                </div>
                <span class="employee-name">{{ s.name || "—" }}</span>
              </div>
            </td>
            <td class="position-cell">{{ s.position || "—" }}</td>
            <td class="salary-cell">₹{{ s.salary || "—" }}</td>
            <td class="contact-cell">
              <div class="contact-info">
                <div class="phone">{{ s.phone || "—" }}</div>
                <div class="email">{{ s.email }}</div>
              </div>
            </td>
            <td class="requests-cell">
              <span v-if="s.status === 'pending'" class="badge pending"
                >Reg Pending</span
              >
              <span
                v-else-if="s.resignationStatus === 'pending'"
                class="badge resignation"
                >Resign Pending</span
              >
              <span v-else class="badge">0</span>
            </td>
            <td class="date-cell">
              {{
                s.dateOfJoining
                  ? new Date(s.dateOfJoining).toLocaleDateString("en-CA")
                  : "—"
              }}
            </td>
            <td class="date-cell">
              {{
                s.resignationDate
                  ? new Date(s.resignationDate).toLocaleDateString("en-CA")
                  : "—"
              }}
            </td>
            <td class="actions-cell">
              <div class="action-menu">
                <button
                  @click="toggleMenu(s._id)"
                  class="menu-trigger"
                  title="More options"
                >
                  ⋮
                </button>
                <div v-if="activeMenu === s._id" class="dropdown-menu">
                  <button
                    v-if="s.resignationStatus === 'pending'"
                    @click="approveResignation(s._id)"
                    class="menu-item approve"
                  >
                    ✓ Approve Resignation
                  </button>
                  <button
                    v-if="s.resignationStatus === 'pending'"
                    @click="rejectResignation(s._id)"
                    class="menu-item delete"
                  >
                    ✕ Reject Resignation
                  </button>
                  <button
                    v-if="s.status === 'pending'"
                    @click="openApproveModal(s)"
                    class="menu-item approve"
                  >
                    ✓ Approve
                  </button>
                  <button
                    v-if="s.status === 'active'"
                    @click="openEditModal(s)"
                    class="menu-item edit"
                  >
                    ✏️ Edit Details
                  </button>
                  <button
                    v-if="s.status === 'active'"
                    @click="setStatus(s._id, 'deactivated')"
                    class="menu-item deactivate"
                  >
                    ⊘ Deactivate
                  </button>
                  <button
                    v-if="s.status === 'deactivated'"
                    @click="setStatus(s._id, 'active')"
                    class="menu-item activate"
                  >
                    ✓ Activate
                  </button>
                  <button @click="exportStaffPDF(s)" class="menu-item download">
                    📄 Download PDF
                  </button>
                  <button
                    @click="openDeleteModal(s._id)"
                    class="menu-item delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredStaff.length === 0" class="no-data">
        No employees found
      </div>
    </div>

    <!-- Edit/Approve Details Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ isApproveMode ? "Approve Staff" : "Edit Staff Details" }}</h2>
          <button class="modal-close" @click="closeEditModal">✕</button>
        </div>
        <form @submit.prevent="submitStaffDetails" class="invite-form-modal">
          <div class="form-group">
            <label>Position</label>
            <input
              v-model="editForm.position"
              type="text"
              placeholder="e.g. Manager, Sales, Driver"
              required
            />
          </div>
          <div class="form-group">
            <label>Salary</label>
            <input
              v-model="editForm.salary"
              type="number"
              placeholder="Enter salary"
              required
            />
          </div>
          <div v-if="isApproveMode" class="form-group">
            <label>Joining Date</label>
            <input v-model="editForm.joiningDate" type="date" required />
          </div>
          <button type="submit" class="btn-submit">
            {{ isApproveMode ? "Approve" : "Save Changes" }}
          </button>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="cancelDelete">
      <div class="modal-delete" @click.stop>
        <div class="delete-icon">⚠️</div>
        <h3>Delete Employee</h3>
        <p>Are you sure you want to permanently delete this staff?</p>
        <p class="warning">This action cannot be undone.</p>
        <div class="modal-actions-delete">
          <button @click="confirmDelete" class="btn-delete-confirm">
            Delete
          </button>
          <button @click="cancelDelete" class="btn-delete-cancel">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  data() {
    return {
      email: "",
      staff: [],
      searchQuery: "",
      statusFilter: "",
      toastMessage: "",
      toastError: false,
      showDeleteModal: false,
      showInviteForm: false,
      deleteId: null,
      activeMenu: null,
      showEditModal: false,
      isApproveMode: false,
      editForm: {
        id: null,
        position: "",
        salary: "",
        joiningDate: new Date().toISOString().split("T")[0],
      },
    };
  },
  computed: {
    filteredStaff() {
      return this.staff.filter((s) => {
        const matchesSearch =
          !this.searchQuery ||
          s.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          s.email?.toLowerCase().includes(this.searchQuery.toLowerCase());

        let matchesStatus = true;
        if (this.statusFilter === "resignation_pending") {
          matchesStatus = s.resignationStatus === "pending";
        } else if (this.statusFilter) {
          matchesStatus = s.status === this.statusFilter;
        }

        return matchesSearch && matchesStatus;
      });
    },
    stats() {
      return {
        total: this.staff.length,
        pending: this.staff.filter((s) => s.status === "pending").length,
        active: this.staff.filter((s) => s.status === "active").length,
        deactivated: this.staff.filter((s) => s.status === "deactivated")
          .length,
        resignation: this.staff.filter((s) => s.resignationStatus === "pending")
          .length,
      };
    },
    departmentData() {
      const departments = {};
      this.staff.forEach((s) => {
        const dept = s.department || "Unassigned";
        departments[dept] = (departments[dept] || 0) + 1;
      });
      return departments;
    },
  },
  methods: {
    async fetchStaff() {
      try {
        const res = await axios.get("http://localhost:5000/api/staff");
        this.staff = res.data.staff;
      } catch (err) {
        this.showToast("Failed to fetch staff", true);
      }
    },
    async inviteStaff() {
      try {
        await axios.post("http://localhost:5000/api/staff/invite", {
          email: this.email,
        });
        this.showToast("Invitation sent!");
        this.email = "";
        this.fetchStaff();
      } catch (err) {
        this.showToast(
          err.response?.data?.message || "Error sending invite",
          true
        );
      }
    },
    async approveStaff(id, data = {}) {
      try {
        const payload = {
          joiningDate: data.joiningDate || new Date().toISOString(),
          position: data.position,
          salary: data.salary,
        };
        const res = await axios.put(
          `http://localhost:5000/api/staff/approve/${id}`,
          payload
        );
        this.showToast(res.data.message || "Staff approved successfully");
        this.fetchStaff();
      } catch (err) {
        this.showToast(
          err.response?.data?.message || "Error approving staff",
          true
        );
      }
    },
    openEditModal(staff) {
      this.isApproveMode = false;
      this.editForm = {
        id: staff._id,
        position: staff.position || "",
        salary: staff.salary || "",
      };
      this.showEditModal = true;
      this.activeMenu = null;
    },
    openApproveModal(staff) {
      this.isApproveMode = true;
      this.editForm = {
        id: staff._id,
        position: staff.position || "",
        salary: staff.salary || "",
        joiningDate: new Date().toISOString().split("T")[0],
      };
      this.showEditModal = true;
      this.activeMenu = null;
    },
    closeEditModal() {
      this.showEditModal = false;
      this.editForm = { id: null, position: "", salary: "", joiningDate: "" };
    },
    async submitStaffDetails() {
      if (this.isApproveMode) {
        await this.approveStaff(this.editForm.id, this.editForm);
      } else {
        await this.updateStaffDetails(this.editForm.id, this.editForm);
      }
      this.closeEditModal();
    },
    async updateStaffDetails(id, data) {
      try {
        const res = await axios.put(
          `http://localhost:5000/api/staff/update-details/${id}`,
          {
            position: data.position,
            salary: data.salary,
          }
        );
        this.showToast(res.data.message || "Details updated");
        this.fetchStaff();
      } catch (err) {
        this.showToast(
          err.response?.data?.message || "Error updating details",
          true
        );
      }
    },
    async approveResignation(id) {
      try {
        const res = await axios.put(
          `http://localhost:5000/api/staff/resign/approve/${id}`
        );
        this.showToast(res.data.message || "Resignation approved successfully");
        this.fetchStaff();
      } catch (err) {
        this.showToast(
          err.response?.data?.message || "Error approving resignation",
          true
        );
      }
    },
    async rejectResignation(id) {
      try {
        const res = await axios.put(
          `http://localhost:5000/api/staff/resign/reject/${id}`
        );
        this.showToast(res.data.message || "Resignation rejected");
        this.fetchStaff();
      } catch (err) {
        this.showToast(
          err.response?.data?.message || "Error rejecting resignation",
          true
        );
      }
    },
    async setStatus(id, status) {
      try {
        await axios.put(`http://localhost:5000/api/staff/status/${id}`, {
          status,
        });
        this.showToast("Status updated successfully");
        this.fetchStaff();
      } catch (err) {
        this.showToast("Failed to update status", true);
      }
    },

    // --- Delete with Modal ---
    openDeleteModal(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteId = null;
    },
    async confirmDelete() {
      try {
        await axios.delete(`http://localhost:5000/api/staff/${this.deleteId}`);
        this.showToast("Staff deleted successfully");
        this.fetchStaff();
      } catch (err) {
        this.showToast(
          err.response?.data?.message || "Error deleting staff",
          true
        );
      }
      this.showDeleteModal = false;
      this.deleteId = null;
    },

    toggleMenu(staffId) {
      this.activeMenu = this.activeMenu === staffId ? null : staffId;
    },

    showToast(message, isError = false) {
      this.toastMessage = message;
      this.toastError = isError;
      setTimeout(() => {
        this.toastMessage = "";
        this.toastError = false;
      }, 3000);
    },

    // --- PDF Methods (unchanged) ---
    exportStaffPDF(staff) {
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

      if (staff.profilePhoto) {
        const staffImg = new Image();
        staffImg.src = `http://localhost:5000${staff.profilePhoto}`;
        doc.addImage(staffImg, "JPEG", 160, 10, 35, 35);
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Personal Information", 14, 55);

      autoTable(doc, {
        startY: 60,
        theme: "grid",
        head: [["Field", "Value"]],
        body: [
          ["Name", staff.name || "—"],
          ["Email", staff.email],
          ["Phone", staff.phone || "—"],
          ["Gender", staff.gender || "—"],
          ["Address", staff.address || "—"],
          ["Pincode", staff.pincode || "—"],
        ],
      });

      let finalY = doc.lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Work Information", 14, finalY);

      autoTable(doc, {
        startY: finalY + 5,
        theme: "grid",
        head: [["Field", "Value"]],
        body: [
          [
            "Date of Joining",
            staff.dateOfJoining
              ? new Date(staff.dateOfJoining).toLocaleDateString()
              : "—",
          ],
          ["Status", staff.status || "—"],
          ["Position", staff.position || "—"],
          [
            "Resignation Date",
            staff.resignationDate
              ? new Date(staff.resignationDate).toLocaleDateString()
              : "—",
          ],
        ],
      });

      let footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        14,
        footerY
      );

      doc.save(`${staff.name || "staff"}_details.pdf`);
    },

    exportAllStaffPDF() {
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

      autoTable(doc, {
        startY: 50,
        head: [
          [
            "Name",
            "Email",
            "Phone",
            "Gender",
            "Address",
            "Pincode",
            "Position",
            "Joining Date",
            "Resign Date",
            "Status",
          ],
        ],
        body: this.staff.map((s) => [
          s.name || "—",
          s.email,
          s.phone || "—",
          s.gender || "—",
          s.address || "—",
          s.pincode || "—",
          s.position || "—",
          s.dateOfJoining
            ? new Date(s.dateOfJoining).toLocaleDateString()
            : "—",
          s.resignationDate
            ? new Date(s.resignationDate).toLocaleDateString()
            : "—",
          s.status || "—",
        ]),
      });

      let footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        14,
        footerY
      );

      doc.save("staff-report.pdf");
    },
  },
  mounted() {
    this.fetchStaff();
  },
};
</script>

<style scoped>
.staff-management {
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #ffffff;
  min-height: 100vh;
}

.top-header {
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #f0f1f3;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #f0f1f3;
}

.metric-card {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.metric-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.metric-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.metric-number {
  font-size: 32px;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.metric-progress {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.progress-bar.pending-bar {
  background: linear-gradient(90deg, #f59e0b 0%, #d97706 100%);
}

.progress-bar.active-bar {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-bar.deactivated-bar {
  background: linear-gradient(90deg, #ef4444 0%, #dc2626 100%);
}

.progress-bar.resignation-bar {
  background: linear-gradient(90deg, #d97706 0%, #b45309 100%);
}

.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 24px 32px;
  background: white;
  border-bottom: 1px solid #f0f1f3;
}

.chart-container {
  background: linear-gradient(135deg, #f9fafb 0%, #ffffff 100%);
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.chart-container h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.chart-container canvas {
  display: block;
  max-height: 250px;
}

.top-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: 0.5px;
}

.header-section {
  background: white;
  padding: 20px 32px;
  margin: 24px 32px 0 32px;
  border-radius: 12px 12px 0 0;
  border: 1px solid #e5e7eb;
  border-bottom: none;
}

.table-container {
  margin: 0 32px 32px 32px;
}

.table-container + .header-section {
  border-radius: 0;
  margin-top: 0;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  margin: 0;
}

.search-filter {
  display: flex;
  gap: 16px;
  flex: 1;
  min-width: 320px;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-input {
  width: 100%;
  padding: 10px 16px 10px 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
  box-sizing: border-box;
}

.search-input::placeholder {
  color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.05);
}

.search-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  cursor: text;
  font-size: 16px;
}

.status-filter {
  padding: 10px 12px;
  height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #1e293b;
  font-weight: 500;
  box-sizing: border-box;
  flex-shrink: 0;
}

.status-filter:hover {
  border-color: #9ca3af;
}

.status-filter:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.05);
}

.action-buttons-header {
  display: flex;
  gap: 12px;
}

.btn-add {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #3b82f6;
  color: white;
  box-shadow: none;
}

.btn-add:hover {
  background: #2563eb;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
}

.table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto; /* Enable horizontal scrolling */
  border: 1px solid #e5e7eb;
  margin: 0 32px 32px 32px;
  min-height: 400px;
}

.staff-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1000px; /* Ensure table doesn't squash too much */
}

.staff-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.staff-table tbody tr:last-child td {
  border-bottom: none;
}

.staff-table th {
  padding: 16px 16px; /* Reduced padding */
  text-align: left;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0;
  text-transform: none;
  white-space: nowrap; /* Prevent headers from wrapping */
}

.staff-table td {
  padding: 16px 16px; /* Reduced padding */
  border-bottom: 1px solid #f3f4f6;
  font-size: 14px;
  color: #1e293b;
  vertical-align: middle;
}

.staff-table tbody tr {
  transition: all 0.2s ease;
  overflow: visible;
}

.staff-table tbody tr:hover {
  background: #f9fafb;
  box-shadow: inset 0 0 12px rgba(59, 130, 246, 0.04);
}

.staff-table td {
  overflow: visible;
}

.id-cell {
  font-weight: 600;
  color: #475569;
}

.name-cell {
  padding: 14px 16px;
}

.employee-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.employee-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
  border: 2px solid white;
}

.employee-name {
  font-weight: 600;
  color: #3b82f6;
}

.department-cell {
  color: #1e293b;
  font-weight: 500;
}

.contact-cell {
  font-size: 13px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.phone {
  font-weight: 500;
  color: #1e293b;
}

.email {
  color: #9ca3af;
  font-size: 12px;
}

.requests-cell {
  text-align: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 10px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.pending {
  background: #dcfce7;
  color: #15803d;
}

.badge.resignation {
  background: #fef3c7;
  color: #d97706;
}

.date-cell {
  color: #1e293b;
  font-weight: 500;
}

.actions-cell {
  text-align: center;
  overflow: visible;
  position: relative;
}

.action-menu {
  position: relative;
  display: inline-block;
  z-index: 200;
}

.menu-trigger {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  transition: all 0.2s ease;
}

.menu-trigger:hover {
  color: #475569;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 1001;
  margin-top: 6px;
  overflow: hidden;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 11px 14px;
  border: none;
  background: none;
  text-align: left;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #374151;
  font-weight: 500;
}

.menu-item:first-child {
  border-radius: 9px 9px 0 0;
}

.menu-item:last-child {
  border-radius: 0 0 9px 9px;
}

.menu-item:hover {
  background: #f3f4f6;
  padding-left: 16px;
}

.menu-item.approve {
  color: #10b981;
}

.menu-item.approve:hover {
  background: #ecfdf5;
}

.menu-item.deactivate {
  color: #f59e0b;
}

.menu-item.deactivate:hover {
  background: #fffbeb;
}

.menu-item.activate {
  color: #10b981;
}

.menu-item.activate:hover {
  background: #ecfdf5;
}

.menu-item.download {
  color: #06b6d4;
}

.menu-item.download:hover {
  background: #ecfdfd;
}

.menu-item.delete {
  color: #ef4444;
}

.menu-item.delete:hover {
  background: #fef2f2;
}

.menu-item.approve-resign {
  color: #8b5cf6;
}
.menu-item.approve-resign:hover {
  background: #f5f3ff;
}

.menu-item.reject-resign {
  color: #ef4444;
}
.menu-item.reject-resign:hover {
  background: #fef2f2;
}

.no-data {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
  font-size: 14px;
}

.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 14px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
  z-index: 2000;
}

.toast.success {
  background: #10b981;
  color: white;
}

.toast.error {
  background: #ef4444;
  color: white;
}

@keyframes slideInRight {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
  backdrop-filter: blur(2px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 14px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 90%;
  animation: slideUp 0.3s ease;
  border: 1px solid #f0f1f3;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #f0f1f3;
  background: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1e293b;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
}

.invite-form-modal {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invite-form-modal input {
  padding: 11px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 9px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #1e293b;
}

.invite-form-modal input::placeholder {
  color: #94a3b8;
}

.invite-form-modal input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
  background: #f9fafb;
}

.btn-submit {
  padding: 12px 18px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
}

.modal-delete {
  background: white;
  border-radius: 14px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  padding: 36px;
  text-align: center;
  animation: slideUp 0.3s ease;
  border: 1px solid #f0f1f3;
}

.delete-icon {
  font-size: 56px;
  margin-bottom: 18px;
  display: inline-block;
}

.modal-delete h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.modal-delete p {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #475569;
}

.modal-delete p.warning {
  color: #dc2626;
  font-weight: 600;
  margin-bottom: 24px;
}

.modal-actions-delete {
  display: flex;
  gap: 14px;
  justify-content: center;
}

.btn-delete-confirm {
  padding: 11px 28px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.2);
}

.btn-delete-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

.btn-delete-cancel {
  padding: 11px 28px;
  background: #f3f4f6;
  color: #374151;
  border: 1.5px solid #e5e7eb;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-delete-cancel:hover {
  background: #e5e7eb;
  border-color: #d1d5db;
}

@media (max-width: 768px) {
  .top-header {
    padding: 16px 20px;
  }

  .metrics-section {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
    padding: 16px 20px;
  }

  .metric-card {
    padding: 16px;
  }

  .metric-number {
    font-size: 24px;
  }

  .chart-container canvas {
    max-height: 200px;
  }

  .charts-section {
    grid-template-columns: 1fr;
    padding: 16px 20px;
    gap: 12px;
  }

  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-filter {
    flex-direction: column;
    min-width: unset;
  }

  .action-buttons-header {
    flex-direction: column;
  }

  .btn-add,
  .btn-import {
    width: 100%;
    text-align: center;
  }

  .staff-table th,
  .staff-table td {
    padding: 12px 16px;
    font-size: 12px;
  }

  .employee-avatar {
    width: 36px;
    height: 36px;
    font-size: 13px;
  }

  .dropdown-menu {
    min-width: 140px;
  }
}
</style>
