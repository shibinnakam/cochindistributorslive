<template>
  <header>
    <nav class="navbar">
      <div class="logo-area">
        <img src="@/assets/logo.jpeg" alt="Logo" class="site-logo" />
        <span class="site-name">Cochin Distributors</span>
      </div>
      <ul class="nav-links">
        <li><router-link to="/" exact>Home</router-link></li>
        <li><router-link to="/about">About</router-link></li>
        <li><a href="#products">Products</a></li>
        <li><router-link to="/contact">Contact</router-link></li>
        <li>
          <router-link to="/login" class="login-link">Login</router-link>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script>
export default {
  name: "AppNavbar",
};
</script>

<style scoped>
header {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 10;
  padding: 0.8rem 2rem;
  background-color: white; /* Always white */
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); /* Always shadow */
  transition: background-color 0.3s ease;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.site-logo {
  height: 40px;
  width: 40px;
}

.site-name {
  font-weight: bold;
  font-size: 1.5rem;
  color: #333; /* Always dark text */
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 1.5rem;
  margin: 0;
  padding: 0;
}

.nav-links a,
.nav-links .router-link-exact-active,
.nav-links .router-link-active {
  text-decoration: none;
  font-weight: 500;
  color: #333; /* Always dark */
  transition: color 0.3s ease;
}

.login-link {
  padding: 6px 12px;
  border: 1px solid #333; /* Always dark border */
  border-radius: 4px;
  transition: all 0.3s ease;
}

.login-link:hover {
  background-color: #007bff;
  color: white !important;
  border-color: #007bff;
}
</style>
