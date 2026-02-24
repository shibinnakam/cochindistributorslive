<template>
  <div class="about-page">
    <!-- Header Section -->
    <section class="about-header">
      <div class="header-overlay"></div>
      <h1 class="page-title">About Us</h1>
    </section>

    <!-- Our Story Section -->
    <section class="our-story container">
      <div class="story-grid">
        <div class="story-image" v-animate-on-scroll>
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800" alt="Warehouse Distribution" class="chef-img" />
        </div>
        <div class="story-content" v-animate-on-scroll>
          <h2 class="section-title">Our Heritage</h2>
          <p class="story-text">
            Cochin Distributors is a well-established merchant distribution agency located in Kattappana, Idukki. With over 13 years of experience, we have built a strong reputation for reliability, efficiency, and quality service across the Idukki region.
          </p>
          <p class="story-text">
            Founded with the vision of delivering quality packaged food products to retailers efficiently, we have grown into a trusted name in the local distribution sector, ensuring timely supply to shops, supermarkets, and merchants throughout the district.
          </p>
          <div class="founder-info">
            <h4 class="founder-name">Serving Idukki Since 2011</h4>
            <p class="founder-role">Quality Service, Timely Delivery</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Distribution Features Section -->
    <section class="distribution-details container">
      <div class="details-grid">
        <div class="detail-card" v-animate-on-scroll>
          <div class="detail-icon">🛍️</div>
          <h3>Products Distributed</h3>
          <ul>
            <li>🍪 Biscuits (Parle-G, 20-20, etc.)</li>
            <li>🍿 Snacks and Packaged Chips</li>
            <li>🥤 Cool Drinks and Beverages</li>
            <li>🥨 Essential Packaged Foods</li>
          </ul>
        </div>
        <div class="detail-card" v-animate-on-scroll>
          <div class="detail-icon">🚚</div>
          <h3>Distribution Network</h3>
          <p>Our self-managed delivery system ensures timely transportation and safe product handling across Kattappana and surrounding hilly regions.</p>
        </div>
        <div class="detail-card" v-animate-on-scroll>
          <div class="detail-icon">👥</div>
          <h3>Our Workforce</h3>
          <p>A dedicated team of 10 members including sales representatives, delivery personnel, and warehouse handlers ensuring smooth operations.</p>
        </div>
      </div>
    </section>

    <!-- Newsletter Section -->
    <section class="newsletter-section">
      <div class="container">
        <h2 class="newsletter-title">Subscribe To Our Newsletter</h2>
        <form class="newsletter-form" @submit.prevent="subscribe">
          <input type="email" placeholder="your email address" required v-model="email" />
          <button type="submit" class="btn-subscribe">Subscribe</button>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
  data() {
    return {
      email: ""
    };
  },
  methods: {
    subscribe() {
      alert("Thank you for subscribing!");
      this.email = "";
    }
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
.about-page {
  font-family: 'Plus Jakarta Sans', sans-serif;
  color: #5d4037;
  background-color: #ffffff;
  padding-top: 80px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* --- Header --- */
.about-header {
  height: 40vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=1200') center/cover no-repeat;
  margin-top: 80px;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: rgba(62, 39, 35, 0.4);
}

.page-title {
  position: relative;
  z-index: 1;
  font-family: 'Dancing Script', cursive;
  font-size: 4.5rem;
  color: white;
  font-weight: 700;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* --- Our Story --- */
.our-story {
  padding: 8rem 0;
}

.story-grid {
  display: flex;
  align-items: center;
  gap: 5rem;
}

.story-image {
  flex: 1;
  opacity: 0;
  transform: translateX(-30px);
  transition: all 0.8s ease;
}

.story-image.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.chef-img {
  width: 100%;
  border-radius: 15px;
  box-shadow: 20px 20px 50px rgba(0,0,0,0.05);
}

.story-content {
  flex: 1.2;
  opacity: 0;
  transform: translateX(30px);
  transition: all 0.8s ease 0.2s;
}

.story-content.is-visible {
  opacity: 1;
  transform: translateX(0);
}

.section-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3.5rem;
  margin-bottom: 2rem;
  color: #3e2723;
}

.story-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #8d6e63;
  margin-bottom: 2rem;
}

.founder-info {
  margin-top: 3rem;
}

.founder-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: #3e2723;
  margin-bottom: 0.2rem;
}

.founder-role {
  color: #efa962;
  font-weight: 600;
  font-size: 0.9rem;
}

/* --- Distribution Details --- */
.distribution-details {
  padding-bottom: 8rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.detail-card {
  background: #fff5e6;
  padding: 3rem 2rem;
  border-radius: 15px;
  text-align: center;
  transition: transform 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.detail-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.detail-card:hover {
  transform: translateY(-10px);
}

.detail-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.detail-card h3 {
  font-size: 1.5rem;
  color: #3e2723;
  margin-bottom: 1rem;
}

.detail-card ul {
  list-style: none;
  padding: 0;
  color: #8d6e63;
  line-height: 2;
}

.detail-card p {
  color: #8d6e63;
  line-height: 1.6;
}

/* --- Newsletter --- */
.newsletter-section {
  background-color: #3e2723;
  padding: 6rem 0;
  text-align: center;
  color: white;
}

.newsletter-title {
  font-family: 'Dancing Script', cursive;
  font-size: 3.2rem;
  margin-bottom: 3.5rem;
}

.newsletter-form {
  display: flex;
  justify-content: center;
  gap: 1rem;
  max-width: 600px;
  margin: 0 auto;
}

.newsletter-form input {
  flex: 1;
  padding: 1.1rem 1.5rem;
  border-radius: 4px;
  border: 1px solid #5d4037;
  background: #2b1b17;
  color: white;
  font-size: 1rem;
}

.btn-subscribe {
  background-color: #efa962;
  color: white;
  border: none;
  padding: 1.1rem 2.5rem;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-subscribe:hover {
  background-color: #e69642;
  transform: translateY(-2px);
}

@media (max-width: 992px) {
  .story-grid {
    flex-direction: column;
    text-align: center;
  }
  .story-content { transform: translateX(0); }
  .page-title { font-size: 3.5rem; }
  .testimonial-header { font-size: 2.8rem; }
}

@media (max-width: 768px) {
  .newsletter-form {
    flex-direction: column;
  }
}
</style>
