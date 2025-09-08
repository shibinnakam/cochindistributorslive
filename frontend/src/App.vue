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
  computed: {
    isDashboard() {
      // Hide navbar if route starts with /admin or /staff
      return (
        this.$route.path.startsWith("/admin") ||
        this.$route.path.startsWith("/staff")
      );
    },
  },
};
</script>
