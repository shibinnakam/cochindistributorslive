<template>
  <div class="profile-page">
    <h1>Admin Profile</h1>

    <div v-if="loading">Loading profile...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="profile-card">
      <p><strong>Username:</strong> {{ profile.username }}</p>
      <p><strong>Email:</strong> {{ profile.email }}</p>
      <p><strong>Date of Birth:</strong> {{ profile.dob }}</p>
      <p><strong>Phone:</strong> {{ profile.phone }}</p>
      <p><strong>Address:</strong> {{ profile.address }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      profile: null,
      error: null,
      loading: true, // added loading state
    };
  },
  async created() {
    try {
      const token = localStorage.getItem("token"); // token should be stored at login
      if (!token) {
        this.error = "No token found. Please log in again.";
        this.loading = false;
        return;
      }

      const res = await axios.get("http://localhost:5000/api/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      this.profile = res.data;
    } catch (err) {
      this.error = "Failed to load profile";
      console.error("Profile fetch error:", err);
    } finally {
      this.loading = false; // stop loading after request
    }
  },
};
</script>

<style scoped>
.profile-page {
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  max-width: 500px;
  margin: 20px auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.profile-card p {
  font-size: 16px;
  margin: 8px 0;
}

.error {
  color: red;
  font-weight: bold;
}
</style>
