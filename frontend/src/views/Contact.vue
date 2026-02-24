<template>
  <div class="contact-page">
    <!-- Immersive Header Section -->
    <section class="contact-hero">
      <div class="hero-overlay"></div>
      <div class="hero-content" v-animate-on-scroll>
        <h1 class="page-title">Contact Us</h1>
        <p class="page-subtitle">We would love to hear from you. Let's start a conversation.</p>
      </div>
      <div class="scroll-indicator">
        <div class="mouse"></div>
      </div>
    </section>

    <!-- Main Contact Section -->
    <section class="main-contact container">
      <div class="redesign-grid">
        <!-- Info Column with Enhanced Cards -->
        <div class="info-column">
          <div class="section-intro" v-animate-on-scroll>
            <h2 class="script-title">Get In Touch</h2>
            <p>Our team is here to help you with any questions or concerns you might have. Reach out via any of the channels below.</p>
          </div>

          <div class="contact-cards">
            <div class="contact-card" v-animate-on-scroll :style="{ transitionDelay: '0.1s' }">
              <div class="card-icon"><i class="fas fa-map-marked-alt"></i></div>
              <div class="card-body">
                <h3>Our Bakery</h3>
                <p>123 Bakery Street, Cochin<br/>Kerala, India 682001</p>
              </div>
            </div>

            <div class="contact-card" v-animate-on-scroll :style="{ transitionDelay: '0.2s' }">
              <div class="card-icon"><i class="fas fa-phone-volume"></i></div>
              <div class="card-body">
                <h3>Phone</h3>
                <p>+91 98765 43210<br/>+91 484 234 5678</p>
              </div>
            </div>

            <div class="contact-card" v-animate-on-scroll :style="{ transitionDelay: '0.3s' }">
              <div class="card-icon"><i class="fas fa-paper-plane"></i></div>
              <div class="card-body">
                <h3>Email</h3>
                <p>hello@cochindistributors.com<br/>support@cochin.dist</p>
              </div>
            </div>
          </div>

          <div class="social-box" v-animate-on-scroll>
            <span>Follow our journey</span>
            <div class="social-icons">
              <a href="#" class="social-btn facebook"><i class="fab fa-facebook-f"></i></a>
              <a href="#" class="social-btn instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" class="social-btn twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" class="social-btn youtube"><i class="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>

        <!-- Premium Form Column -->
        <div class="form-column" v-animate-on-scroll>
          <div class="form-premium-card">
            <div class="card-header">
              <i class="fas fa-envelope-open-text"></i>
              <h3>Send a Message</h3>
            </div>
            <form @submit.prevent="submitForm">
              <div class="input-row">
                <div class="input-group">
                  <input type="text" v-model="form.firstName" required placeholder=" " />
                  <label>First Name</label>
                  <div class="bar"></div>
                </div>
                <div class="input-group">
                  <input type="text" v-model="form.lastName" required placeholder=" " />
                  <label>Last Name</label>
                  <div class="bar"></div>
                </div>
              </div>

              <div class="input-group">
                <input type="email" v-model="form.email" required placeholder=" " />
                <label>Email Address</label>
                <div class="bar"></div>
              </div>

              <div class="input-group">
                <input type="tel" v-model="form.phone" placeholder=" " />
                <label>Phone (Optional)</label>
                <div class="bar"></div>
              </div>

              <div class="input-group">
                <textarea v-model="form.message" rows="4" required placeholder=" "></textarea>
                <label>How can we help?</label>
                <div class="bar"></div>
              </div>

              <button type="submit" class="btn-premium">
                <span>Submit Message</span>
                <i class="fas fa-long-arrow-alt-right"></i>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>

    <!-- Map Section with decorative framing -->
    <section class="map-immersive">
      <div class="container map-wrapper">
        <div class="map-frame" v-animate-on-scroll>
          <div class="map-inner">
             <div class="map-marker-floating">
               <div class="pin"></div>
               <div class="pulse"></div>
             </div>
             <img src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1200" alt="Map Location" />
          </div>
          <div class="map-details">
            <h2>Find Us Here</h2>
            <p>Visit us for the freshest experience!</p>
            <button class="btn-link">Open in Maps <i class="fas fa-external-link-alt"></i></button>
          </div>
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
      alert("Thank you for reaching out! We will be in touch shortly.");
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
  color: #4a372d;
  background-color: #fffaf5;
  padding-top: 80px;
  overflow-x: hidden;
}

.container {
  max-width: 1240px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* --- Hero Section --- */
.contact-hero {
  height: 450px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: url('https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=1400') center/cover no-repeat fixed;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(255,250,245,0.7) 0%, rgba(255,250,245,0.4) 100%);
}

.page-title {
  position: relative;
  z-index: 1;
  font-family: 'Dancing Script', cursive;
  font-size: clamp(3.5rem, 8vw, 5.5rem);
  color: #3e2723;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  position: relative;
  z-index: 1;
  font-size: 1.25rem;
  color: #6d4c41;
  font-weight: 500;
  max-width: 600px;
  margin: 0 auto;
}

.scroll-indicator {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
}

.mouse {
  width: 25px;
  height: 40px;
  border: 2px solid #3e2723;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  padding-top: 5px;
}

.mouse::before {
  content: '';
  width: 3px;
  height: 10px;
  background: #3e2723;
  border-radius: 2px;
  animation: scrollDown 2s infinite ease-out;
}

@keyframes scrollDown {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(15px); opacity: 0; }
}

/* --- Main Section Grid --- */
.main-contact {
  padding: 10rem 0;
}

.redesign-grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 8rem;
  align-items: start;
}

/* --- Info Column --- */
.section-intro {
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
}

.section-intro.is-visible {
  opacity: 1; transform: translateY(0);
}

.script-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3.5rem;
  color: #3e2723;
  margin-bottom: 1.5rem;
}

.section-intro p {
  line-height: 1.8;
  color: #795548;
  font-size: 1.1rem;
}

.contact-cards {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 4rem;
}

.contact-card {
  background: white;
  padding: 2.5rem;
  border-radius: 16px;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  box-shadow: 0 10px 30px rgba(74, 55, 45, 0.04);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0;
  transform: translateX(-30px);
}

.contact-card.is-visible {
  opacity: 1; transform: translateX(0);
}

.contact-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px rgba(74, 55, 45, 0.08);
}

.card-icon {
  width: 65px;
  height: 65px;
  background: #fff5eb;
  color: #efa962;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
  transition: all 0.3s ease;
}

.contact-card:hover .card-icon {
  background: #efa962;
  color: white;
  transform: rotate(10deg);
}

.card-body h3 {
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
  color: #3e2723;
}

.card-body p {
  color: #8d6e63;
  line-height: 1.6;
}

.social-box {
  background: #3e2723;
  padding: 2rem;
  border-radius: 16px;
  color: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  opacity: 0;
  transform: scale(0.9);
  transition: all 0.6s ease;
}

.social-box.is-visible {
  opacity: 1; transform: scale(1);
}

.social-icons {
  display: flex;
  gap: 1.2rem;
}

.social-btn {
  width: 48px;
  height: 48px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  transition: all 0.3s ease;
  text-decoration: none;
}

.social-btn:hover {
  background: #efa962;
  transform: translateY(-5px);
}

/* --- Form Column --- */
.form-premium-card {
  background: white;
  padding: 4.5rem;
  border-radius: 24px;
  box-shadow: 0 40px 100px rgba(74, 55, 45, 0.07);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateX(30px);
  transition: all 1s ease;
}

.form-premium-card.is-visible {
  opacity: 1; transform: translateX(0);
}

.form-premium-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 6px; height: 100%;
  background: #efa962;
}

.card-header {
  margin-bottom: 3.5rem;
  display: flex;
  align-items: center;
  gap: 1.2rem;
}

.card-header i { font-size: 2.5rem; color: #efa962; }
.card-header h3 { font-family: 'Dancing Script', cursive; font-size: 2.8rem; color: #3e2723; }

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.input-group {
  position: relative;
  margin-bottom: 3rem;
}

.input-group input,
.input-group textarea {
  width: 100%;
  padding: 12px 10px 10px 5px;
  display: block;
  border: none;
  border-bottom: 2px solid #e0d5d0;
  background: transparent;
  font-size: 1.1rem;
  color: #3e2723;
  transition: all 0.3s ease;
}

.input-group input:focus,
.input-group textarea:focus {
  outline: none;
}

.input-group label {
  color: #8d6e63;
  font-size: 1.05rem;
  font-weight: 500;
  position: absolute;
  pointer-events : none;
  left: 5px;
  top: 10px;
  transition: all 0.3s ease;
}

.input-group input:focus ~ label,
.input-group input:not(:placeholder-shown) ~ label,
.input-group textarea:focus ~ label,
.input-group textarea:not(:placeholder-shown) ~ label {
  top: -20px;
  font-size: 0.9rem;
  color: #efa962;
  font-weight: 700;
}

.bar {
  position: relative;
  display: block;
  width: 100%;
}

.bar:before, .bar:after {
  content: '';
  height: 2px;
  width: 0;
  bottom: 0px;
  position: absolute;
  background: #efa962;
  transition: all 0.3s ease;
}

.bar:before { left: 50%; }
.bar:after { right: 50%; }

.input-group input:focus ~ .bar:before, .input-group input:focus ~ .bar:after,
.input-group textarea:focus ~ .bar:before, .input-group textarea:focus ~ .bar:after {
  width: 50%;
}

.btn-premium {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.2rem;
  width: 100%;
  padding: 1.5rem;
  background: #3e2723;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 2rem;
}

.btn-premium:hover {
  background: #efa962;
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(239, 169, 98, 0.3);
}

/* --- Map Immersive --- */
.map-immersive {
  padding-bottom: 10rem;
}

.map-frame {
  display: flex;
  background: white;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 40px 100px rgba(74, 55, 45, 0.08);
  opacity: 0;
  transform: translateY(40px);
  transition: all 1s ease;
}

.map-frame.is-visible {
  opacity: 1; transform: translateY(0);
}

.map-inner {
  flex: 1.5;
  height: 500px;
  position: relative;
}

.map-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-marker-floating {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -100%);
  z-index: 5;
}

.pin {
  width: 30px; height: 30px;
  border-radius: 50% 50% 50% 0;
  background: #efa962;
  transform: rotate(-45deg);
  position: relative;
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.pin::after {
  content: '';
  width: 14px; height: 14px;
  margin: 8px 0 0 8px;
  background: #3e2723;
  position: absolute;
  border-radius: 50%;
}

.pulse {
  background: rgba(239,169,98,0.5);
  border-radius: 50%;
  height: 40px; width: 40px;
  position: absolute;
  left: 50%; top: 50%;
  transform: translate(-50%, -50%);
  z-index: -2;
  animation: pulsePin 2s infinite;
}

@keyframes pulsePin {
  0% { transform: translate(-50%, -50%) scale(0.1); opacity: 0; }
  50% { opacity: 0.6; }
  100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
}

.map-details {
  flex: 1;
  padding: 5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fffdfc;
}

.map-details h2 { font-family: 'Dancing Script', cursive; font-size: 3rem; margin-bottom: 1.5rem; color: #3e2723; }
.map-details p { font-size: 1.15rem; color: #8d6e63; margin-bottom: 2.5rem; line-height: 1.6; }

.btn-link {
  background: none; border: none;
  font-size: 1.1rem; font-weight: 700;
  color: #efa962; cursor: pointer;
  display: flex; align-items: center; gap: 0.8rem;
  padding: 0;
  transition: all 0.3s ease;
}

.btn-link:hover { color: #3e2723; transform: translateX(5px); }

@media (max-width: 1024px) {
  .redesign-grid { grid-template-columns: 1fr; gap: 6rem; }
  .map-frame { flex-direction: column; }
  .map-inner { height: 400px; }
  .map-details { padding: 3rem; text-align: center; align-items: center; }
}

@media (max-width: 768px) {
  .form-premium-card { padding: 2rem; }
  .input-row { grid-template-columns: 1fr; gap: 0; }
  .page-title { font-size: 3.5rem; }
  .main-contact { padding: 5rem 0; }
}
</style>
