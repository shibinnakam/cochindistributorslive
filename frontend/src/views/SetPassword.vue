<template>
  <div class="set-password">
    <div class="set-password-box">
      <h2>Set Your Password</h2>

      <input
        type="password"
        placeholder="Enter new password"
        v-model="password"
      />
      <input
        type="password"
        placeholder="Confirm new password"
        v-model="confirmPassword"
      />

      <button @click="setPassword" :disabled="loading">
        {{ loading ? "Setting..." : "Set Password" }}
      </button>

      <p v-if="message" :class="isError ? 'error' : 'success'">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      password: "",
      confirmPassword: "",
      message: "",
      isError: false,
      loading: false,
    };
  },
  methods: {
    async setPassword() {
      this.message = "";
      this.isError = false;

      if (!this.password || this.password.length < 6) {
        this.message = "Password must be at least 6 characters";
        this.isError = true;
        return;
      }

      if (this.password !== this.confirmPassword) {
        this.message = "Passwords do not match";
        this.isError = true;
        return;
      }

      const token = this.$route.params.token || this.$route.query.token;
      const email = this.$route.query.email;

      if (!token || !email) {
        this.message = "Invalid or missing reset information";
        this.isError = true;
        return;
      }

      this.loading = true;
      try {
        const res = await axios.post(
          `${process.env.VUE_APP_API_URL}/api/auth/set-password`,
          { token, email, password: this.password }
        );

        this.message = res.data.msg || "Password set successfully!";
        this.isError = false;

        setTimeout(() => {
          this.$router.push("/login");
        }, 2000);
      } catch (err) {
        this.message = err.response?.data?.msg || "Error setting password";
        this.isError = true;
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.set-password {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f5f7fa;
}

.set-password-box {
  background: rgba(255, 255, 255, 0.9);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 400px;
  width: 100%;
  text-align: center;
}

input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  width: 100%;
  padding: 10px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background: #90caf9;
  cursor: not-allowed;
}

.error {
  color: red;
  margin-top: 10px;
}

.success {
  color: green;
  margin-top: 10px;
}
</style>
