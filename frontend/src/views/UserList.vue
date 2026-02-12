<template>
  <div class="user-list">
    <h2>All Users</h2>

    <div v-if="loading">Loading users...</div>

    <div class="table-responsive">
      <table v-else class="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Pincode</th>
            <th>Store Name</th>
            <th>Store Address</th>
            <th>Landmark</th>
            <th>Role</th>
            <th>Verification</th>
            <th>Status</th>
            <th>Block/Unblock</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user._id">
            <td>{{ user.name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.phone }}</td>
            <td>{{ user.pincode }}</td>
            <td>{{ user.storeName }}</td>
            <td>{{ user.storeAddress }}</td>
            <td>{{ user.landmark }}</td>
            <td>{{ user.role }}</td>
            <td>
              <span
                :class="{
                  verified: user.verificationStatus === 'verified',
                  pending: user.verificationStatus === 'pending',
                  notverified: user.verificationStatus === 'not_verified',
                }"
              >
                {{ user.verificationStatus }}
              </span>
            </td>
            <td>
              <span :class="user.isBlocked ? 'blocked' : 'active'">
                {{ user.isBlocked ? "Blocked" : "Active" }}
              </span>
            </td>
            <td>
              <button @click="toggleBlock(user._id)" class="btn-block">
                {{ user.isBlocked ? "Unblock" : "Block" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";

export default {
  name: "UserList",
  data() {
    return {
      users: [],
      loading: true,
    };
  },
  methods: {
    async fetchUsers() {
      try {
        const res = await axios.get("/api/admin/uservarificationroute");
        this.users = res.data;
        this.loading = false;
      } catch (err) {
        console.error("Error fetching users", err);
      }
    },
    async toggleBlock(userId) {
      try {
        await axios.put(`/api/admin/uservarificationroute/${userId}/block`);
        this.fetchUsers(); // refresh list
      } catch (err) {
        console.error("Error updating user", err);
      }
    },
  },
  mounted() {
    this.fetchUsers();
  },
};
</script>

<style scoped>
.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  min-width: 1200px;
}

.table-responsive {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.user-table th,
.user-table td {
  padding: 12px;
  border: 1px solid #ddd;
  text-align: left;
  font-size: 14px;
}

.btn-block {
  padding: 6px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.btn-block:hover {
  background: #f5f5f5;
}

.blocked {
  color: #ef4444;
  font-weight: bold;
}
.active {
  color: #10b981;
  font-weight: bold;
}
.verified {
  color: #10b981;
  font-weight: bold;
}
.pending {
  color: #f59e0b;
  font-weight: bold;
}
.notverified {
  color: #ef4444;
  font-weight: bold;
}

@media (max-width: 768px) {
  .user-list {
    padding: 10px;
  }
  
  h2 {
    font-size: 1.5rem;
    margin-bottom: 15px;
  }
}
</style>
