<template>
  <div class="login-container">
    <!-- Black transparent overlay -->
    <div class="overlay"></div>

    <!-- Centered Login/Signup Form -->
    <div class="login-form-section">
      <div :class="['login-box', isFilled ? 'box-filled' : '']">
        <img src="@/assets/logo.jpeg" alt="Company Logo" class="logo" />

        <h2 class="form-title">{{ formTitle }}</h2>

        <p class="signup-link">
          {{ toggleText }}
          <a href="#" @click.prevent="toggleMode">{{ toggleLinkText }}</a>
        </p>

        <form
          class="login-form"
          @submit.prevent="handleSubmit"
          @input="checkFilled"
          novalidate
        >
          <label for="email" class="sr-only">Email</label>
          <input
            type="email"
            id="email"
            v-model.trim="email"
            placeholder="Enter email"
            required
            autocomplete="username"
            :aria-invalid="emailError ? 'true' : 'false'"
          />
          <p v-if="emailError" class="error">{{ emailError }}</p>

          <label for="password" class="sr-only">Password</label>
          <input
            type="password"
            id="password"
            v-model.trim="password"
            placeholder="Enter password"
            required
            :autocomplete="isSignup ? 'new-password' : 'current-password'"
            :aria-invalid="passwordError ? 'true' : 'false'"
          />
          <p v-if="passwordError" class="error">{{ passwordError }}</p>

          <a
            v-if="!isSignup"
            href="#"
            class="forgot-password"
            @click.prevent="forgotPassword"
          >
            Forgot your password?
          </a>

          <button type="submit" class="login-button" :disabled="loading">
            <span v-if="loading">Processing...</span>
            <span v-else>{{ isSignup ? "Sign Up" : "Login" }}</span>
          </button>
        </form>

        <footer class="form-footer">
          <small>© 2025 YourCompany. All rights reserved.</small>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "LoginPage",
  data() {
    return {
      isSignup: false,
      email: "",
      password: "",
      isFilled: false,
      emailError: "",
      passwordError: "",
      loading: false,
    };
  },
  computed: {
    formTitle() {
      return this.isSignup ? "Sign Up" : "Login";
    },
    toggleText() {
      return this.isSignup
        ? "Already have an account?"
        : "Don’t have an account?";
    },
    toggleLinkText() {
      return this.isSignup ? "Login" : "Create an account";
    },
  },
  methods: {
    toggleMode() {
      this.isSignup = !this.isSignup;
      this.resetForm();
    },
    resetForm() {
      this.email = "";
      this.password = "";
      this.isFilled = false;
      this.emailError = "";
      this.passwordError = "";
    },
    checkFilled() {
      this.isFilled = this.email.trim() !== "" && this.password.trim() !== "";
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    validatePassword(password) {
      const passwordRegex =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
      return passwordRegex.test(password);
    },
    async handleSubmit() {
      this.emailError = "";
      this.passwordError = "";

      if (!this.validateEmail(this.email)) {
        this.emailError = "Please enter a valid email address.";
      }
      if (this.isSignup && !this.validatePassword(this.password)) {
        this.passwordError =
          "Password must be at least 8 characters long, contain uppercase, lowercase, a number, and a special character.";
      }

      if (this.emailError || this.passwordError) return;

      this.loading = true;

      try {
        const endpoint = this.isSignup
          ? "/api/auth/register"
          : "/api/auth/login";

        const { data } = await axios.post(endpoint, {
          email: this.email,
          password: this.password,
        });

        if (this.isSignup) {
          alert("Registered successfully. Please login.");
          this.toggleMode();
        } else {
          // Save token and user info (including role)
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          alert("Login successful!");

          // Redirect based on role
          if (data.user.role === "user") {
            this.$router.push("/user");
          } else if (data.user.role === "admin") {
            this.$router.push("/admin");
          } else {
            this.$router.push("/");
          }
        }
      } catch (err) {
        console.error("Auth error:", err);
        alert(err.response?.data?.msg || "Something went wrong.");
      } finally {
        this.loading = false;
      }
    },
    forgotPassword() {
      this.$router.push({ name: "ForgotPassword" });
    },
  },
};
</script>

<style scoped>
.sr-only {
  position: absolute;
  left: -9999px;
}
.login-container {
  position: relative;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url("@/assets/bakery1.jpg") no-repeat center center / cover;
  font-family: "Segoe UI", sans-serif;
  padding: 1rem;
  box-sizing: border-box;
}
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
.login-form-section {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-box {
  max-width: 400px;
  width: 100%;
  background-color: #ffffff;
  padding: 2.5rem 3rem;
  border-radius: 30px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  transition: border 0.3s ease, box-shadow 0.3s ease;
}
.box-filled {
  border-color: #3b82f6;
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.3);
}
.logo {
  height: 60px;
  margin-bottom: 1rem;
  display: block;
  margin-left: auto;
  margin-right: auto;
}
.form-title {
  text-align: center;
  font-size: 1.6rem;
  margin-bottom: 0.5rem;
}
.signup-link {
  text-align: center;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}
.signup-link a {
  color: #007bff;
  text-decoration: none;
  cursor: pointer;
}
.login-form input {
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 0.3rem;
  border: 1px solid #ced4da;
  border-radius: 5px;
}
.login-form input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 5px rgba(59, 130, 246, 0.4);
}
.error {
  font-size: 0.8rem;
  color: red;
  margin-bottom: 0.5rem;
}
.forgot-password {
  font-size: 0.85rem;
  color: #007bff;
  text-decoration: none;
  display: block;
  margin-bottom: 1rem;
}
.login-button {
  width: 100%;
  background-color: #1e3a8a;
  color: white;
  border: none;
  padding: 0.6rem;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s ease;
}
.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.login-button:hover:not(:disabled) {
  background-color: #1d4ed8;
}
.form-footer {
  text-align: center;
  margin-top: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}
</style>
