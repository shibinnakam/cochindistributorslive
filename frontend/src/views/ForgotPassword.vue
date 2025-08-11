<template>
  <div class="forgot-container">
    <div class="forgot-box">
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a password reset link.</p>

      <form @submit.prevent="handleForgotPassword" novalidate>
        <input
          type="email"
          v-model.trim="email"
          placeholder="Enter your email"
          required
          autocomplete="email"
        />
        <button type="submit" :disabled="loading">
          <span v-if="loading">Sending...</span>
          <span v-else>Send Reset Link</span>
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
  name: "ForgotPassword",
  data() {
    return {
      email: "",
      message: "",
      error: "",
      loading: false,
    };
  },
  methods: {
    async handleForgotPassword() {
      this.message = "";
      this.error = "";

      if (!this.email) {
        this.error = "Please enter your email.";
        return;
      }

      try {
        this.loading = true;
        const res = await axios.post("/api/auth/forgot-password", {
          email: this.email,
        });
        this.message =
          res.data.message || "If registered, a reset link has been sent.";
      } catch (err) {
        this.error = err.response?.data?.msg || "Error sending reset link.";
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.forgot-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: rgba(0, 0, 0, 0.05);
}

.forgot-box {
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
