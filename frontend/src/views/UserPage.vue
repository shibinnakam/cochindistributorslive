<template>
  <div class="user-page">
    <h1>Welcome, User!</h1>
    <button @click="logout">Logout</button>
  </div>
</template>

<script>
export default {
  name: "UserPage",
  methods: {
    logout() {
      // Clear token or user data from localStorage or Vuex
      localStorage.removeItem("token");
      // Redirect to login page
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 50px;
}

button {
  background-color: #1e3a8a;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 20px;
}

button:hover {
  background-color: #374bb0;
}
</style>
