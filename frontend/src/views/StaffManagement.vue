<template>
  <div class="staff-management">
    <h2>Staff Management</h2>

    <!-- Invite Form -->
    <form @submit.prevent="inviteStaff" class="invite-form">
      <input
        v-model="email"
        type="email"
        placeholder="Enter staff email"
        required
      />
      <button type="submit">Invite</button>
    </form>

    <!-- Toast Notification -->
    <div
      v-if="toastMessage"
      :class="['toast', toastError ? 'error' : 'success']"
    >
      {{ toastMessage }}
    </div>

    <!-- Staff List -->
    <h3>Staff List</h3>
    <table>
      <thead>
        <tr>
          <th>Email</th>
          <th>Name</th>
          <th>Phone</th>
          <th>Date of Joining</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in staff" :key="s._id">
          <td>{{ s.email }}</td>
          <td>{{ s.name || "—" }}</td>
          <td>{{ s.phone || "—" }}</td>
          <td>
            {{
              s.dateOfJoining
                ? new Date(s.dateOfJoining).toLocaleDateString()
                : "—"
            }}
          </td>
          <td>{{ s.status }}</td>
          <td class="action-buttons">
            <button v-if="s.status === 'pending'" @click="approveStaff(s._id)">
              Approve
            </button>
            <button
              v-if="s.status === 'active'"
              @click="setStatus(s._id, 'deactivated')"
            >
              Deactivate
            </button>
            <button
              v-if="s.status === 'deactivated'"
              @click="setStatus(s._id, 'active')"
            >
              Activate
            </button>

            <!-- PDF -->
            <button @click="exportStaffPDF(s)">Download PDF</button>

            <!-- Delete -->
            <button @click="openDeleteModal(s._id)" class="delete-btn">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Export All -->
    <button @click="exportAllStaffPDF" class="export-all">
      Download All Staff Report
    </button>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Are you sure you want to permanently delete this staff?</h3>
        <p>This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="confirm-btn">Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
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
      toastMessage: "",
      toastError: false,
      showDeleteModal: false,
      deleteId: null,
    };
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
    async approveStaff(id) {
      try {
        const joiningDate = new Date().toISOString();
        const res = await axios.put(
          `http://localhost:5000/api/staff/approve/${id}`,
          { joiningDate }
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
            "Date of Joining",
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
          s.dateOfJoining
            ? new Date(s.dateOfJoining).toLocaleDateString()
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
  padding: 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.staff-management h2,
.staff-management h3 {
  margin-bottom: 15px;
  color: #333;
}

/* Invite Form */
.invite-form {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.invite-form input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  flex: 1;
}

.invite-form button {
  padding: 10px 16px;
  background: linear-gradient(135deg, #3498db, #1e6bb8);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.25s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}
.invite-form button:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

/* Table Styling */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

thead {
  background-color: #f7f7f7;
}

th,
td {
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

tr:nth-child(even) {
  background-color: #fafafa;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

/* Action + PDF + Delete + Export All Buttons */
.action-buttons button,
.delete-btn,
.export-all {
  min-width: 110px;
  height: 38px;
  padding: 0 14px;
  background: linear-gradient(135deg, #34495e, #2c3e50);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.25s ease-in-out;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.action-buttons button:hover,
.delete-btn:hover,
.export-all:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

/* Delete button */
.delete-btn {
  min-width: 110px;
  font-size: 14px;
  font-weight: 600;
}

/* Toast Styling */
.toast {
  margin: 15px 0;
  padding: 10px;
  border-radius: 6px;
  font-size: 14px;
  color: white;
}
.toast.success {
  background-color: #2ecc71;
}
.toast.error {
  background-color: #e74c3c;
}

/* --- Modal Styling --- */
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
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.modal h3 {
  font-size: 16px;
  margin-bottom: 10px;
}
.modal p {
  font-size: 14px;
  margin-bottom: 20px;
  color: #666;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.confirm-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #d10000ff, #b20707ff);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.cancel-btn {
  padding: 8px 16px;
  background: #eee;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
</style>
