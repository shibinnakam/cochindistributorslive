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
          <img src="https://images.unsplash.com/photo-1583394202118-028302f37e44?auto=format&fit=crop&q=80&w=800" alt="Our Chef" class="chef-img" />
        </div>
        <div class="story-content" v-animate-on-scroll>
          <h2 class="section-title">Our Story</h2>
          <p class="story-text">
            We began our journey with a passion for good, homemade food. Our founder started this bakery to share his love of bread, cakes, pastries and other baked goodness with the world. Supported by our local farmers and suppliers, we have started this bakery to bring people together from far and wide with the love of freshly made food that tastes like home.
          </p>
          <p class="story-text">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo sed diam voluptua.
          </p>
          <div class="founder-info">
            <h4 class="founder-name">Adam Smith</h4>
            <p class="founder-role">Owner, Bready Bake</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonial Section -->
    <section class="testimonial-section">
      <div class="testimonial-bg">
        <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=1200" alt="Baking session" class="bg-img" />
        <div class="bg-overlay"></div>
      </div>
      <div class="testimonial-content container" v-animate-on-scroll>
        <h2 class="testimonial-header">Hear From Our Customers</h2>
        <p class="testimonial-subheader">Don't just take our word for it. Hear what our customers have to say about our bakery.</p>
        
        <div class="testimonial-card">
          <p class="quote">
            "Absolutely loved it! They were amazing and I was completely satisfied with them. Would definitely recommend to all my friends and family"
          </p>
          <div class="customer-info">
            <img src="https://i.pravatar.cc/100?u=logan" alt="Logan May" class="customer-avatar" />
            <h4 class="customer-name">Logan May</h4>
          </div>
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
  height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: url('https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&q=80&w=1200') center/cover no-repeat;
}

.header-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.4);
}

.page-title {
  position: relative;
  z-index: 1;
  font-family: 'Dancing Script', cursive;
  font-size: 4.5rem;
  color: #3e2723;
  font-weight: 700;
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

/* --- Testimonial --- */
.testimonial-section {
  position: relative;
  padding: 10rem 0;
  min-height: 500px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.testimonial-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.bg-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
}

.testimonial-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.testimonial-header {
  font-family: 'Dancing Script', cursive;
  font-size: 3.8rem;
  margin-bottom: 1rem;
}

.testimonial-subheader {
  font-size: 1.1rem;
  margin-bottom: 4rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.testimonial-card {
  background: white;
  padding: 4rem 3rem;
  max-width: 650px;
  margin: 0 auto;
  border-radius: 10px;
  color: #5d4037;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
}

.quote {
  font-size: 1.2rem;
  line-height: 1.8;
  font-style: italic;
  margin-bottom: 2.5rem;
}

.customer-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.customer-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  border: 3px solid #efa962;
}

.customer-name {
  font-weight: 700;
  font-size: 1.1rem;
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
