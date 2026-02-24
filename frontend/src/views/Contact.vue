<template>
  <div class="contact-page">
    <!-- Header Section -->
    <section class="contact-header">
      <div class="header-overlay"></div>
      <h1 class="page-title">Contact Us</h1>
    </section>

    <!-- Contact Section -->
    <section class="contact-section container">
      <div class="contact-grid">
        <!-- Info Column -->
        <div class="contact-info" v-animate-on-scroll>
          <h2 class="section-title">Get In Touch</h2>
          <p class="info-intro">We'd love to hear from you. Whether you have a question about our products, pricing, or anything else, our team is ready to answer all your questions.</p>
          
          <div class="info-items">
            <div class="info-item">
              <div class="icon-box"><i class="fas fa-map-marker-alt"></i></div>
              <div class="item-text">
                <h3>Our Location</h3>
                <p>123 Bakery Street, Cochin, Kerala, India</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-box"><i class="fas fa-phone-alt"></i></div>
              <div class="item-text">
                <h3>Phone Number</h3>
                <p>+91 98765 43210</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-box"><i class="fas fa-envelope"></i></div>
              <div class="item-text">
                <h3>Email Address</h3>
                <p>hello@cochindistributors.com</p>
              </div>
            </div>
            <div class="info-item">
              <div class="icon-box"><i class="fas fa-clock"></i></div>
              <div class="item-text">
                <h3>Working Hours</h3>
                <p>Mon - Sat: 9:00 AM - 8:00 PM</p>
              </div>
            </div>
          </div>

          <div class="social-links">
            <a href="#" class="social-link"><i class="fab fa-facebook-f"></i></a>
            <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
          </div>
        </div>

        <!-- Form Column -->
        <div class="contact-form-wrapper" v-animate-on-scroll>
          <div class="form-card">
            <form @submit.prevent="submitForm">
              <div class="form-row">
                <div class="form-group">
                  <label>First Name</label>
                  <input type="text" v-model="form.firstName" placeholder="John" required />
                </div>
                <div class="form-group">
                  <label>Last Name</label>
                  <input type="text" v-model="form.lastName" placeholder="Doe" required />
                </div>
              </div>
              <div class="form-group">
                <label>Email Address</label>
                <input type="email" v-model="form.email" placeholder="john@example.com" required />
              </div>
              <div class="form-group">
                <label>Phone Number</label>
                <input type="tel" v-model="form.phone" placeholder="+91 ..." />
              </div>
              <div class="form-group">
                <label>Your Message</label>
                <textarea v-model="form.message" rows="5" placeholder="How can we help you?" required></textarea>
              </div>
              <button type="submit" class="btn-submit">Send Message</button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Placeholder/Integration Section -->
    <section class="map-section">
      <div class="map-placeholder">
        <div class="map-overlay">
          <p><i class="fas fa-map-marked-alt"></i></p>
          <span>Find us on Google Maps</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "ContactPage",
  data() {
    return {
      form: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      },
    };
  },
  methods: {
    submitForm() {
      alert("Message sent successfully! We will get back to you soon.");
      this.form = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      };
    },
  },
  directives: {
    animateOnScroll: {
      mounted(el) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              el.classList.add('is-visible');
              observer.unobserve(el);
            }
          });
        }, { threshold: 0.1 });
        observer.observe(el);
      }
    }
  }
};
</script>

<style scoped>
.contact-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #5d4037;
  background-color: #fffdfa;
  padding-top: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* --- Header --- */
.contact-header {
  height: 250px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1200') center/cover no-repeat;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.45);
}

.page-title {
  position: relative;
  z-index: 1;
  font-family: 'Dancing Script', cursive;
  font-size: 4rem;
  color: #3e2723;
  font-weight: 700;
}

/* --- Contact Section --- */
.contact-section {
  padding: 8rem 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 6rem;
  align-items: start;
}

.contact-info {
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s ease;
}

.contact-info.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.section-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3.2rem;
  margin-bottom: 1.5rem;
  color: #3e2723;
}

.info-intro {
  font-size: 1.1rem;
  line-height: 1.8;
  color: #8d6e63;
  margin-bottom: 3.5rem;
}

.info-items {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.info-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
}

.icon-box {
  width: 55px;
  height: 55px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  color: #efa962;
  box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.item-text h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  color: #3e2723;
}

.item-text p {
  font-size: 1rem;
  color: #8d6e63;
}

.social-links {
  display: flex;
  gap: 1rem;
  margin-top: 4rem;
}

.social-link {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  border: 1px solid #e0d5d0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5d4037;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-link:hover {
  background-color: #efa962;
  color: white;
  border-color: #efa962;
  transform: translateY(-3px);
}

/* --- Form Card --- */
.contact-form-wrapper {
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s ease 0.2s;
}

.contact-form-wrapper.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.form-card {
  background: white;
  padding: 3.5rem;
  border-radius: 12px;
  box-shadow: 0 30px 60px rgba(0,0,0,0.06);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #3e2723;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group input,
.form-group textarea {
  padding: 1rem 1.25rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #efa962;
  background-color: white;
  box-shadow: 0 0 0 4px rgba(239, 169, 98, 0.1);
}

.btn-submit {
  width: 100%;
  background-color: #3e2723;
  color: white;
  border: none;
  padding: 1.25rem;
  border-radius: 6px;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
}

.btn-submit:hover {
  background-color: #efa962;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(239, 169, 98, 0.2);
}

/* --- Map Section --- */
.map-section {
  height: 450px;
  background-color: #f1f5f9;
}

.map-placeholder {
  height: 100%;
  width: 100%;
  background: url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200') center/cover no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
}

.map-overlay {
  background: white;
  padding: 2.5rem 4rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.map-overlay i {
  font-size: 2.5rem;
  color: #efa962;
  margin-bottom: 1rem;
}

.map-overlay span {
  display: block;
  font-weight: 700;
  color: #3e2723;
}

@media (max-width: 1024px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  .page-title { font-size: 3rem; }
  .section-title { font-size: 2.8rem; }
  .form-card { padding: 2rem; }
}
</style>
