<template>
  <div id="app">
    <!-- Navbar always visible -->
    <Navbar @open-login="showLogin = true" />

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
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
}
</style>
