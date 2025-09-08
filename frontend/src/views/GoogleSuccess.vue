<template>
  <div>Processing Google login...</div>
</template>

<script>
export default {
  mounted() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const user = JSON.parse(decodeURIComponent(params.get("user")));

    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "admin") {
        this.$router.push("/admin");
      } else {
        this.$router.push("/user");
      }
    } else {
      this.$router.push("/");
    }
  },
};
</script>
