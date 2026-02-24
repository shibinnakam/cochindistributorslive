<template>
  <footer class="app-footer">
    <div class="footer-container container">
      <div class="footer-grid">
        <!-- Brand Section -->
        <div class="footer-brand">
          <div class="brand-logo">
            <span class="logo-accent">Cochin</span> Distributors
          </div>
          <p class="brand-tagline">
            Your trusted partner in FMCG distribution across Idukki for over 13 years.
          </p>
        </div>

        <!-- Quick Links -->
        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><router-link to="/">Home</router-link></li>
            <li><router-link to="/about">About Us</router-link></li>
            <li><router-link to="/products">Products</router-link></li>
            <li><router-link to="/contact">Contact</router-link></li>
          </ul>
        </div>

        <!-- Contact Section -->
        <div class="footer-contact">
          <h4>Contact Info</h4>
          <div class="contact-item">
            <span class="icon">📍</span>
            <p>Santhinagar Merchant Association Kattappana idukki kerala.</p>
          </div>
          <div class="contact-item">
            <span class="icon">📞</span>
            <p>9207369246</p>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <p>&copy; {{ currentYear }} Cochin Distributors. All rights reserved.</p>
        <div class="footer-social">
          <a href="#" class="social-link">Facebook</a>
          <a href="#" class="social-link">Instagram</a>
          <a href="#" class="social-link">WhatsApp</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: "AppFooter",
  computed: {
    currentYear() {
      return new Date().getFullYear();
    }
  }
};
</script>

<style scoped>
.app-footer {
  background-color: #3e2723;
  color: #fffaf5;
  padding: 5rem 0 2rem;
  margin-top: auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1.5fr;
  gap: 4rem;
  margin-bottom: 4rem;
}

.brand-logo {
  font-size: 1.8rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
}

.logo-accent {
  color: #efa962;
  font-family: "Dancing Script", cursive;
}

.brand-tagline {
  color: #d7ccc8;
  line-height: 1.6;
  max-width: 300px;
}

.footer-links h4, .footer-contact h4 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #efa962;
}

.footer-links ul {
  list-style: none;
  padding: 0;
}

.footer-links li {
  margin-bottom: 1rem;
}

.footer-links a {
  color: #d7ccc8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: #efa962;
}

.contact-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: flex-start;
}

.contact-item .icon {
  font-size: 1.2rem;
}

.contact-item p {
  color: #d7ccc8;
  line-height: 1.5;
  margin: 0;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: #a1887f;
}

.footer-social {
  display: flex;
  gap: 2rem;
}

.social-link {
  color: #a1887f;
  text-decoration: none;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: #efa962;
}

@media (max-width: 992px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
    text-align: center;
  }
  
  .brand-tagline {
    margin: 0 auto;
  }
  
  .contact-item {
    justify-content: center;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1.5rem;
  }
}
</style>
