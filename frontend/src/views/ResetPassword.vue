<template>
  <div class="reset-container">
    <div class="reset-box">
      <h2>Reset Password</h2>

      <form @submit.prevent="handleResetPassword" novalidate>
        <input
          type="password"
          v-model.trim="password"
          placeholder="New password"
          required
          autocomplete="new-password"
        />
        <input
          type="password"
          v-model.trim="confirmPassword"
          placeholder="Confirm new password"
          required
          autocomplete="new-password"
        />

        <button type="submit" :disabled="loading">
          <span v-if="loading">Updating...</span>
          <span v-else>Reset Password</span>
        </button>
      </form>

      <p v-if="message" class="success">{{ message }}</p>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ResetPassword",
  data() {
    return {
      password: "",
      confirmPassword: "",
      message: "",
      error: "",
      loading: false,
    };
  },
  computed: {
    token() {
      return this.$route.query.token || "";
    },
    email() {
      return this.$route.query.email || "";
    },
  },
  methods: {
    async handleResetPassword() {
      this.message = "";
      this.error = "";

      if (!this.token || !this.email) {
        this.error = "Invalid or missing reset link details.";
        return;
      }

      if (!this.password || !this.confirmPassword) {
        this.error = "Please fill both password fields.";
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.error = "Passwords do not match.";
        return;
      }

      try {
        this.loading = true;
        const res = await axios.post("/api/auth/reset-password", {
          token: this.token,
          email: this.email,
          password: this.password,
        });
        this.message = res.data.message || "Password updated successfully.";
        setTimeout(() => {
          this.$router.push("/login");
        }, 1500);
      } catch (err) {
        this.error = err.response?.data?.msg || "Error resetting password.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(0, 0, 0, 0.05);
}

.reset-box {
  background: #fff;
  padding: 2rem;
  border-radius: 10px;
  max-width: 380px;
  width: 100%;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

input {
  width: 100%;
  padding: 0.6rem;
  margin-bottom: 1rem;
  border-radius: 6px;
  border: 1px solid #ddd;
  box-sizing: border-box;
}

button {
  width: 100%;
  padding: 0.6rem;
  border-radius: 6px;
  border: none;
  background: #1e3a8a;
  color: white;
  cursor: pointer;
}

.success {
  color: green;
  font-size: 0.9rem;
}

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
