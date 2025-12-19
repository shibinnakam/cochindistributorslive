<template>
  <div class="user-list">
    <h2>All Users</h2>

    <div v-if="loading">Loading users...</div>

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
            <button @click="toggleBlock(user._id)">
              {{ user.isBlocked ? "Unblock" : "Block" }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from "axios";

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
        const res = await axios.get(
          "http://localhost:5000/api/admin/uservarificationroute"
        );
        this.users = res.data;
        this.loading = false;
      } catch (err) {
        console.error("Error fetching users", err);
      }
    },
    async toggleBlock(userId) {
      try {
        await axios.put(
          `http://localhost:5000/api/admin/uservarificationroute/${userId}/block`
        );
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
}

.user-table th,
.user-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.blocked {
  color: red;
  font-weight: bold;
}
.active {
  color: green;
  font-weight: bold;
}
.verified {
  color: green;
  font-weight: bold;
}
.pending {
  color: orange;
  font-weight: bold;
}
.notverified {
  color: red;
  font-weight: bold;
}
</style>
