<template>
  <header :class="{ 'nav-open': isMenuOpen, scrolled: isScrolled }">
    <nav class="navbar">
      <router-link to="/" class="logo-area">
        <span class="logo-text">FOODIED</span>
      </router-link>

      <!-- Hamburger Menu Button -->
      <button class="menu-toggle" @click="toggleMenu" aria-label="Toggle menu">
        <span class="hamburger"></span>
      </button>

      <ul class="nav-links" :class="{ active: isMenuOpen }">
        <li><router-link to="/" exact @click="closeMenu">Home</router-link></li>
        <li><router-link to="/user" @click="closeMenu">Menu</router-link></li>
        <li>
          <router-link to="/about" @click="closeMenu">About Us</router-link>
        </li>
        <li>
          <router-link to="/contact" @click="closeMenu">Contact</router-link>
        </li>
      </ul>

      <div class="nav-actions">
        <button class="action-btn" aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
        <button class="action-btn" aria-label="Cart">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </button>
        <router-link to="/register" class="signup-btn">Sign Up</router-link>
      </div>
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
      isScrolled: false,
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      this.isScrolled = window.scrollY > 20;
    },
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
  padding: 1.5rem 2rem;
  background-color: transparent;
  transition: all 0.3s ease;
}

header.scrolled {
  background-color: white;
  padding: 0.8rem 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.logo-area {
  text-decoration: none;
}

.logo-text {
  font-weight: 800;
  font-size: 1.5rem;
  color: #000;
  letter-spacing: -0.5px;
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
  color: #333;
  transition: all 0.2s ease;
  font-size: 0.95rem;
}

.nav-links a:hover,
.nav-links .router-link-exact-active {
  color: #7ab342; /* Foodied Green */
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background 0.3s;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.signup-btn {
  padding: 0.8rem 1.8rem;
  background-color: #000;
  color: #fff !important;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  background-color: #333;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
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
  background: #000;
  position: relative;
  transition: all 0.3s ease;
}

.hamburger::before,
.hamburger::after {
  content: "";
  position: absolute;
  width: 24px;
  height: 2px;
  background: #000;
  transition: all 0.3s ease;
}

.hamburger::before {
  top: -8px;
}
.hamburger::after {
  bottom: -8px;
}

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

@media (max-width: 992px) {
  .nav-links {
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  header {
    padding: 1rem 1.25rem;
  }
  .menu-toggle {
    display: block;
  }
  .nav-actions {
    display: none;
  }

  .nav-links {
    position: fixed;
    top: 0;
    right: -100%;
    width: 100%;
    height: 100vh;
    background: white;
    flex-direction: column;
    justify-content: center;
    padding: 2rem;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1050;
  }

  .nav-links.active {
    right: 0;
  }
  .nav-links a {
    font-size: 1.5rem;
    padding: 1.5rem;
  }
}
</style>
