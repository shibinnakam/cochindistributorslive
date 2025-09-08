<template>
  <div>
    <h2>Leave Requests</h2>

    <table class="leave-table">
      <thead>
        <tr>
          <th>Email</th>
          <th>Reason</th>
          <th>Requested Date</th>
          <th>Status</th>
          <th>Approved Date</th>
          <th>Rejected Date</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="leave in leaves" :key="leave._id">
          <td>{{ leave.email }}</td>
          <td>{{ leave.reason }}</td>
          <td>{{ new Date(leave.date).toLocaleDateString() }}</td>
          <td>{{ leave.status }}</td>
          <td>
            {{
              leave.approvedDate
                ? new Date(leave.approvedDate).toLocaleString()
                : "-"
            }}
          </td>
          <td>
            {{
              leave.rejectedDate
                ? new Date(leave.rejectedDate).toLocaleString()
                : "-"
            }}
          </td>
          <td>
            <button
              v-if="leave.status === 'Pending'"
              @click="updateStatus(leave._id, 'Approved')"
            >
              Approve
            </button>
            <button
              v-if="leave.status === 'Pending'"
              @click="updateStatus(leave._id, 'Rejected')"
            >
              Reject
            </button>
            <button @click="deleteLeave(leave._id)" class="delete-btn">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      leaves: [],
    };
  },
  async created() {
    await this.fetchLeaves();
  },
  methods: {
    async fetchLeaves() {
      const res = await fetch("http://localhost:5000/api/leaves/all");
      this.leaves = await res.json();
    },
    async updateStatus(id, status) {
      const res = await fetch(`http://localhost:5000/api/leaves/update/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const updatedLeave = await res.json();
      this.leaves = this.leaves.map((l) => (l._id === id ? updatedLeave : l));
    },
    async deleteLeave(id) {
      if (!confirm("Are you sure you want to delete this leave?")) return;

      await fetch(`http://localhost:5000/api/leaves/delete/${id}`, {
        method: "DELETE",
      });
      this.leaves = this.leaves.filter((l) => l._id !== id);
    },
  },
};
</script>

<style scoped>
.leave-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.leave-table th,
.leave-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.leave-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

button {
  margin: 2px;
  padding: 5px 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:first-of-type {
  background-color: #4caf50;
  color: white;
}

button:nth-of-type(2) {
  background-color: #f44336;
  color: white;
}

.delete-btn {
  background-color: #555;
  color: white;
}
</style>
