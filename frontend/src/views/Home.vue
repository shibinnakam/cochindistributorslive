<template>
  <div class="home-page">
    <!-- Background layers for smooth fade -->
    <div
      v-for="(bg, index) in backgrounds"
      :key="index"
      class="background-layer"
      :style="{ backgroundImage: `url(${bg})` }"
      :class="{ active: backgroundIndex === index }"
    ></div>

    <!-- Hero Section -->
    <section class="hero">
      <h1>Welcome to My Website</h1>
      <p>Explore our products and services</p>
    </section>

    <!-- Cochin Distributors Section -->
    <section class="cochin-section">
      <div class="cochin-container">
        <!-- Left: Image -->
        <div class="cochin-images" :class="{ 'slide-left': animate }">
          <img src="@/assets/bg.jpg" class="img-large" alt="Main" />
          <div class="img-small-column">
            <img src="@/assets/bakery1.jpg" class="img-small" alt="Login" />
            <img src="@/assets/logo.jpeg" class="img-small" alt="Logo" />
          </div>
        </div>

        <!-- Right: Text -->
        <div class="cochin-content" :class="{ 'slide-right': animate }">
          <h3 class="cochinhead">
            <span class="welcome-red">WELCOME TO</span><br />
            <strong>Cochin Distributors</strong>
          </h3>
          <p class="cochintext">
            At Cochin Distributors, we believe in delivering the finest quality
            baking products to every kitchen, whether you're a home baker or a
            commercial chef...
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      animate: false,
      backgroundIndex: 0,
      backgrounds: [
        require("@/assets/bakery1.jpg"),
        require("@/assets/bakery2.jpg"),
      ],
    };
  },
  mounted() {
    setTimeout(() => {
      this.animate = true;
    }, 100);

    this.interval = setInterval(() => {
      this.backgroundIndex =
        (this.backgroundIndex + 1) % this.backgrounds.length;
    }, 5000);
  },
  beforeUnmount() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* Background fade layers */
.background-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.5s ease-in-out;
}
.background-layer.active {
  opacity: 1;
}

.hero {
  height: 100vh;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding-top: 4rem;
  text-shadow: 1px 1px 5px rgba(0, 0, 0, 0.6);
  position: relative;
  z-index: 1;
}

/* Cochin Section */
.cochin-section {
  padding: 2rem;
  background-color: #fff;
  position: relative;
  z-index: 1;
}
.cochin-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;
}
.cochin-images {
  display: flex;
  gap: 1rem;
  opacity: 0;
  transform: translateX(-100%);
  transition: all 1s ease;
}
.cochin-content {
  max-width: 600px;
  opacity: 0;
  transform: translateX(100%);
  transition: all 1s ease;
}
.cochinhead {
  margin: 0;
  font-size: 1.8rem;
  line-height: 1.4;
}
.welcome-red {
  color: red;
  font-weight: bold;
}
.cochintext {
  font-size: 1rem;
  line-height: 1.6;
  color: #333;
  text-align: justify;
}
.img-large {
  width: 220px;
  height: 350px;
  object-fit: cover;
  border-radius: 8px;
}
.img-small-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.img-small {
  width: 220px;
  height: 165px;
  object-fit: contain;
  background-color: #f5f5f5;
  border-radius: 8px;
}
.slide-left {
  transform: translateX(0);
  opacity: 1;
}
.slide-right {
  transform: translateX(0);
  opacity: 1;
}
</style>
