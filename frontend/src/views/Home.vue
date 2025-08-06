<template>
  <div class="home-page" :style="backgroundStyle">
    <!-- Navbar and Hero -->
    <header :class="{ scrolled: isScrolled }">
      <nav class="navbar">
        <div class="logo-area">
          <img src="@/assets/logo.png" alt="Logo" class="site-logo" />
          <span class="site-name">MyWebsite</span>
        </div>
        <ul class="nav-links">
          <li><router-link to="/" exact>Home</router-link></li>
          <li><router-link to="/about">About</router-link></li>
          <li><a href="#products">Products</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><router-link to="/login" class="login-link">Login</router-link></li>
        </ul>
      </nav>
    </header>

    <section class="hero">
      <h1>Welcome to My Website</h1>
      <p>Explore our products and services</p>
    </section>

    <!-- Image and Text Animation Section -->
    <section class="cochin-section">
      <div class="cochin-container">
        <!-- Left: Image -->
        <div class="cochin-images" :class="{ 'slide-left': animate }">
          <img src="@/assets/bg.jpg" class="img-large" alt="Main" />
          <div class="img-small-column">
            <img src="@/assets/login-bg.jpg" class="img-small" alt="Login" />
            <img src="@/assets/logo.png" class="img-small" alt="Logo" />
          </div>
        </div>

        <!-- Right: Text -->
        <div class="cochin-content" :class="{ 'slide-right': animate }">
          <h3 class="cochinhead">
            <span class="welcome-red">WELCOME TO</span><br />
            <strong>Cochin Distributors</strong>
          </h3>
          <p class="cochintext">
            At Cochin Distributors, we believe in delivering the finest quality baking products to every kitchen, whether you're a home baker or a commercial chef.
            Our selection includes premium flours, high-quality baking agents, and essential tools that make your baking easier and more delicious.
            With years of trusted service and a commitment to excellence, Cochin Distributors is your reliable partner in every recipe.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'HomePage',
  data() {
    return {
      isScrolled: false,
      animate: false,
      backgroundIndex: 0,
      backgrounds: [
        require('@/assets/bg.jpg'),
        require('@/assets/login-bg.jpg'),
        // You can add more images here
      ]
    };
  },
  computed: {
    backgroundStyle() {
      return {
        backgroundImage: `url(${this.backgrounds[this.backgroundIndex]})`
      };
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
    setTimeout(() => {
      this.animate = true;
    }, 100);

    // Slide to next background every 5 seconds
    this.interval = setInterval(() => {
      this.backgroundIndex = (this.backgroundIndex + 1) % this.backgrounds.length;
    }, 5000);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
    clearInterval(this.interval);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 50;
    }
  }
};
</script>

<style scoped>
/* Background transitions */
.home-page {
  min-height: 100vh;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow-x: hidden;
  transition: background-image 1.2s ease-in-out;
}

/* Other styles (unchanged) */
header {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 10;
  transition: background-color 0.3s ease;
  padding: 0.8rem 2rem;
}
header.scrolled {
  background-color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  color: white;
}
header.scrolled .site-name {
  color: #333;
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
  color: white;
  transition: color 0.3s ease;
}
header.scrolled .nav-links a,
header.scrolled .nav-links .router-link-exact-active,
header.scrolled .nav-links .router-link-active {
  color: #333;
}
.login-link {
  padding: 6px 12px;
  border: 1px solid white;
  border-radius: 4px;
  transition: all 0.3s ease;
}
header.scrolled .login-link {
  border-color: #333;
}
.login-link:hover {
  background-color: #007bff;
  color: white !important;
  border-color: #007bff;
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
}

.cochin-section {
  padding: 2rem;
  background-color: #fff;
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

/* Slide-in classes */
.slide-left {
  transform: translateX(0);
  opacity: 1;
}
.slide-right {
  transform: translateX(0);
  opacity: 1;
}
</style>
