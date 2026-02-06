<template>
  <div id="app">
    <!-- Navbar only visible when NOT on /admin or /staff -->
    <Navbar v-if="!isDashboard" @open-login="showLogin = true" />

    <!-- Page Content -->
    <router-view />

    <!-- Login Modal -->
    <LoginModal v-if="showLogin" @close="showLogin = false" />
  </div>
</template>

<script>
import axios from "axios";
import Navbar from "@/components/AppNavbar.vue";
import LoginModal from "@/views/Login.vue"; // reuse your existing login.vue

export default {
  name: "App",
  components: { Navbar, LoginModal },
  data() {
    return {
      showLogin: false,
    };
  },
  async created() {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Verify token with backend
        const res = await axios.get("/api/auth/verify");
        if (res.data.valid) {
          // Sync user info just in case
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn("Session verification failed on startup:", err);
        // We don't necessarily logout here, let the interceptor handle 401s
      }
    }
  },
  computed: {
    isDashboard() {
      // Hide navbar if route starts with /admin, /staff, or is /user
      return (
        this.$route.path.startsWith("/admin") ||
        this.$route.path.startsWith("/staff") ||
        this.$route.path === "/user"
      );
    },
  },
};
</script>
