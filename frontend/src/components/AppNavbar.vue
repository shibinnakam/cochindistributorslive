<template>
  <header :class="{ 'nav-open': isMenuOpen }">
    <nav class="navbar">
      <router-link to="/" class="logo-area">
        <div class="logo-circle">
          <img src="@/assets/logo.jpeg" alt="Logo" class="site-logo" />
        </div>
        <span class="site-name"
          >Bready <span class="accent-text">Bake</span></span
        >
      </router-link>

      <!-- Hamburger Menu Button -->
      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
        <span class="hamburger"></span>
      </button>

      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <li><router-link to="/" exact @click="closeMenu">Home</router-link></li>
        <li><router-link to="/about" @click="closeMenu">About</router-link></li>
        <li><a href="#products" @click="closeMenu">Products</a></li>
        <li>
          <router-link to="/contact" @click="closeMenu">Contact</router-link>
        </li>
        <li class="login-item">
          <router-link to="/login" class="login-link" @click="closeMenu">
            Login
          </router-link>
        </li>
      </ul>
    </nav>
    <div class="nav-overlay" @click="closeMenu"></div>
  </header>
</template>

<script>
export default {
  name: "AppNavbar",
  data() {
    return {
      isMenuOpen: false,
    };
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen;
      if (this.isMenuOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    },
    closeMenu() {
      this.isMenuOpen = false;
      document.body.style.overflow = "";
    },
  },
};
</script>

<style scoped>
header {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  padding: 0.8rem 2rem;
  background-color: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
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
  text-decoration: none;
}

.site-logo {
  height: 35px;
  width: 35px;
}

.logo-circle {
  background: white;
  padding: 5px;
  border-radius: 50%;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.site-name {
  font-family: "Dancing Script", cursive;
  font-weight: 700;
  font-size: 1.5rem;
  color: #5d4037;
  white-space: nowrap;
}

.accent-text {
  color: #efa962;
}

.nav-links {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 2.5rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  font-weight: 500;
  color: #795548;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.nav-links a:hover,
.nav-links .router-link-exact-active {
  color: #efa962;
}

.login-link {
  padding: 0.7rem 1.8rem;
  background-color: #efa962;
  color: white !important;
  border-radius: 30px;
  transition: all 0.3s ease;
  font-weight: 600 !important;
  letter-spacing: 0.5px !important;
}

.login-link:hover {
  background-color: #e69642;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(239, 169, 98, 0.4);
}

/* Mobile Toggle */
.menu-toggle {
  display: none;
  background: none;
  border: none;
  padding: 10px;
  cursor: pointer;
  z-index: 1100;
}

.hamburger {
  display: block;
  width: 24px;
  height: 2px;
  background: #1e3a8a;
  position: relative;
  transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  content: "";
  position: absolute;
  width: 24px;
  height: 2px;
  background: #1e3a8a;
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -8px;
}
.hamburger::after {
  bottom: -8px;
}

/* Active State for Hamburger */
.nav-open .hamburger {
  background: transparent;
}
.nav-open .hamburger::before {
  top: 0;
  transform: rotate(45deg);
}
.nav-open .hamburger::after {
  bottom: 0;
  transform: rotate(-45deg);
}

@media (max-width: 768px) {
  header {
    padding: 0.8rem 1.25rem;
  }

  .site-name {
    font-size: 1.1rem;
  }

  .menu-toggle {
    display: block;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 280px;
    height: 100vh;
    background: white;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1050;
    box-shadow: -5px 0 20px rgba(0, 0, 0, 0.1);
  }

  .nav-links.active {
    right: 0;
  }

  .nav-links li {
    width: 100%;
    text-align: center;
  }

  .nav-links a {
    display: block;
    font-size: 1.25rem;
    padding: 1rem;
  }

  .login-item {
    margin-top: 1rem;
    width: 100%;
  }

  .nav-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1000;
  }

  .nav-open .nav-overlay {
    opacity: 1;
    visibility: visible;
  }
}
</style>
