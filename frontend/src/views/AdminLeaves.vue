<template>
  <div class="page-wrapper">
    <div class="content-container">
      <h2 class="page-title">Leave Management</h2>

      <div class="table-card">
        <h3 class="card-title">Staff Leave Requests</h3>

        <div class="table-responsive">
          <table class="leave-table">
            <thead>
              <tr>
                <th>Staff Email</th>
                <th>Reason</th>
                <th>Requested Date</th>
                <th>Status</th>
                <th>Processed On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="leaves.length === 0">
                <td colspan="6" class="empty-state">
                  No leave requests found.
                </td>
              </tr>
              <tr v-for="leave in leaves" :key="leave._id">
                <td>
                  <div class="email-cell">
                    <i class="fas fa-user-circle user-icon"></i>
                    {{ leave.email }}
                  </div>
                </td>
                <td class="reason-cell">{{ leave.reason }}</td>
                <td class="date-cell">{{ formatDate(leave.date) }}</td>
                <td>
                  <span :class="['badge', getStatusClass(leave.status)]">
                    {{ leave.status }}
                  </span>
                </td>
                <td class="date-cell">
                  {{ getProcessedDate(leave) }}
                </td>
                <td>
                  <div class="action-buttons">
                    <template v-if="leave.status === 'Pending'">
                      <button
                        @click="updateStatus(leave._id, 'Approved')"
                        class="btn-icon approve"
                        title="Approve"
                      >
                        <i class="fas fa-check"></i>
                      </button>
                      <button
                        @click="updateStatus(leave._id, 'Rejected')"
                        class="btn-icon reject"
                        title="Reject"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </template>
                    <button
                      @click="openDeleteModal(leave._id)"
                      class="btn-icon delete"
                      title="Delete"
                    >
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" @click="closeDeleteModal">×</button>
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this leave record?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
          <button class="btn-delete" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AdminLeaves",
  data() {
    return {
      leaves: [],
      showDeleteModal: false,
      deleteId: null,
    };
  },
  async created() {
    await this.fetchLeaves();
  },
  methods: {
    async fetchLeaves() {
      try {
        const res = await fetch("http://localhost:5000/api/leaves/all");
        if (res.ok) {
          this.leaves = await res.json();
        }
      } catch (err) {
        console.error("Error fetching leaves:", err);
      }
    },
    async updateStatus(id, status) {
      try {
        const res = await fetch(
          `http://localhost:5000/api/leaves/update/${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
          }
        );
        if (res.ok) {
          const updatedLeave = await res.json();
          this.leaves = this.leaves.map((l) =>
            l._id === id ? updatedLeave : l
          );
        }
      } catch (err) {
        console.error("Error updating status:", err);
      }
    },
    openDeleteModal(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteId = null;
    },
    async confirmDelete() {
      if (!this.deleteId) return;
      try {
        const res = await fetch(
          `http://localhost:5000/api/leaves/delete/${this.deleteId}`,
          {
            method: "DELETE",
          }
        );
        if (res.ok) {
          this.leaves = this.leaves.filter((l) => l._id !== this.deleteId);
          this.closeDeleteModal();
        }
      } catch (err) {
        console.error("Error deleting leave:", err);
      }
    },
    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
    getProcessedDate(leave) {
      if (leave.status === "Approved" && leave.approvedDate) {
        return this.formatDate(leave.approvedDate);
      } else if (leave.status === "Rejected" && leave.rejectedDate) {
        return this.formatDate(leave.rejectedDate);
      }
      return "-";
    },
    getStatusClass(status) {
      switch (status) {
        case "Approved":
          return "status-approved";
        case "Rejected":
          return "status-rejected";
        default:
          return "status-pending";
      }
    },
  },
};
</script>

<style scoped>
/* Page Layout */
.page-wrapper {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 40px 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 15px;
}

/* Card */
.table-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 25px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 20px;
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.leave-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.leave-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.leave-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
}

.leave-table tr:last-child td {
  border-bottom: none;
}

.leave-table tr:hover td {
  background-color: #f8fafc;
}

.email-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  color: #0f172a;
}

.user-icon {
  color: #94a3b8;
  font-size: 16px;
}

.reason-cell {
  max-width: 250px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #475569;
}

.date-cell {
  color: #64748b;
  font-family: "Segoe UI Mono", monospace; /* Monospace for alignment */
  font-size: 13px;
}

/* Status Badges */
.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-approved {
  background-color: #dcfce7;
  color: #166534;
}

.status-rejected {
  background-color: #fee2e2;
  color: #991b1b;
}

.status-pending {
  background-color: #fef3c7;
  color: #92400e;
}

/* Actions */
.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.approve {
  background-color: #dcfce7;
  color: #166534;
}

.approve:hover {
  background-color: #bbf7d0;
  transform: translateY(-1px);
}

.reject {
  background-color: #fee2e2;
  color: #991b1b;
}

.reject:hover {
  background-color: #fecaca;
  transform: translateY(-1px);
}

.delete {
  background-color: #f1f5f9;
  color: #64748b;
}

.delete:hover {
  background-color: #e2e8f0;
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #94a3b8;
  font-style: italic;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 10px;
  color: #475569;
}

.warning-text {
  color: #ef4444 !important;
  font-size: 13px;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px;
  background-color: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
}

.btn-cancel,
.btn-delete {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}
</style>
