<template>
  <div>
    <h1>Admin Page</h1>
    <button @click="logout">Logout</button>

    <h2>Add Staff</h2>
    <form @submit.prevent="addStaff">
      <input type="email" v-model="email" placeholder="Staff Email" required />
      <input
        type="password"
        v-model="password"
        placeholder="Staff Password"
        required
      />
      <button type="submit" :disabled="loading">
        <span v-if="loading">Adding...</span>
        <span v-else>Add Staff</span>
      </button>
    </form>

    <p v-if="message" style="color: green">{{ message }}</p>
    <p v-if="error" style="color: red">{{ error }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      email: "",
      password: "",
      loading: false,
      message: "",
      error: "",
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    async addStaff() {
      this.message = "";
      this.error = "";
      this.loading = true;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "/api/auth/create-staff",
          { email: this.email, password: this.password },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.message = res.data.msg;
        this.email = "";
        this.password = "";
      } catch (err) {
        this.error = err.response?.data?.msg || "Failed to add staff";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
