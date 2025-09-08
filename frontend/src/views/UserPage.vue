<template>
  <div class="user-page">
    <!-- Header -->
    <header class="header">
      <h1>User Dashboard</h1>
    </header>

    <div class="main-layout">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="logo-section">
          <img src="@/assets/logo.jpeg" alt="Logo" class="logo" />
          <h2>User Panel</h2>
        </div>
        <ul class="menu">
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">Products</a></li>
          <li><a href="#">Leaves</a></li>
          <li><a href="#">Profile</a></li>
          <li><a href="#" @click.prevent="logout">Logout</a></li>
        </ul>
      </aside>

      <!-- Main Content -->
      <main class="content">
        <h2>Welcome, User!</h2>
        <p>Select an option from the sidebar to get started.</p>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: "UserPage",
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.user-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Header */
.header {
  width: 100%;
  background-color: #031441ff; /* Dark blue */
  color: white;
  padding: 15px 20px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: bold;
}

/* Layout wrapper */
.main-layout {
  display: flex;
  flex: 1;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background-color: #310650ff; /* Violet */
  color: white;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.logo-section {
  display: flex;
  align-items: center;
  margin-bottom: 30px;
}

.logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
  border-radius: 50%;
}

.logo-section h2 {
  font-size: 1.3rem;
  margin: 0;
}

.menu {
  list-style: none;
  padding: 0;
  margin-top: 20px;
  flex: 1;
}

.menu li {
  margin: 15px 0;
}

.menu a {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  display: block;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.3s;
}

.menu a:hover {
  background-color: #33055fff;
}

/* Main content */
.content {
  flex: 1;
  padding: 40px;
  background-color: #f9f9f9;
}
</style>
