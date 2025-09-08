<template>
  <div class="google-message">
    <h2>Google Sign-In Failed</h2>
    <p>{{ $route.query.msg || "Something went wrong!" }}</p>
    <router-link to="/login">Go back to Login</router-link>
  </div>
</template>

<script>
export default {
  name: "GoogleFailed",
};
</script>

<style scoped>
.google-message {
  max-width: 500px;
  margin: 50px auto;
  padding: 20px;
  background: #ffecec;
  border: 1px solid #f5a5a5;
  border-radius: 8px;
  text-align: center;
}
</style>
