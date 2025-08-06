<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="auth-container">
    <!-- Left Side with Image -->
    <div class="left-side">
      <img :src="require('@/assets/login-bg.jpg')" alt="Login Background" />
    </div>

    <!-- Right Side with Form -->
    <div class="right-side">
      <div class="form-box">
        <h2>{{ isLogin ? 'Login' : 'Sign Up' }}</h2>
        <form @submit.prevent="handleSubmit">
          <input v-model="email" type="email" placeholder="Email" required />
          <input v-model="password" type="password" placeholder="Password" required />
          <button type="submit">{{ isLogin ? 'Login' : 'Sign Up' }}</button>
        </form>
        <p v-if="error" class="error">{{ error }}</p>
        <p class="switch-link">
          {{ isLogin ? "Don't have an account?" : "Already have an account?" }}
          <span @click="toggleMode">{{ isLogin ? 'Sign Up' : 'Login' }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      error: '',
      isLogin: true,
    };
  },
  methods: {
    async handleSubmit() {
      try {
        if (this.isLogin) {
          // LOGIN
          const response = await axios.post('http://localhost:5000/api/auth/login', {
            email: this.email,
            password: this.password,
          });
          localStorage.setItem('token', response.data.token);
          alert('Login Successful!');
          this.$router.push('/dashboard');
        } else {
          // SIGN UP
          await axios.post('http://localhost:5000/api/auth/register', {
            email: this.email,
            password: this.password,
          });
          alert('Signup successful! Now you can log in.');
          this.isLogin = true;
        }
      } catch (err) {
        this.error = err.response?.data?.msg || 'Something went wrong.';
      }
    },
    toggleMode() {
      this.isLogin = !this.isLogin;
      this.error = '';
    },
  },
};
</script>

<style scoped>
.auth-container {
  display: flex;
  height: 100vh;
}

.left-side {
  width: 50%;
  background-color: #000;
}

.left-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.right-side {
  width: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;
}

.form-box {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  width: 300px;
  text-align: center;
}

input {
  display: block;
  margin: 0.5rem 0;
  padding: 0.5rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 6px;
}

button {
  background-color: #007BFF;
  color: white;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
}

button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-top: 0.5rem;
}

.switch-link {
  margin-top: 1rem;
  font-size: 0.9rem;
}

.switch-link span {
  color: #007BFF;
  cursor: pointer;
  text-decoration: underline;
}
</style>
