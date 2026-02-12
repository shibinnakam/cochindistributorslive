<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-bg-overlay"></div>
      <div class="hero-particles">
        <div
          v-for="n in 20"
          :key="n"
          class="particle"
          :style="getParticleStyle(n)"
        ></div>
      </div>

      <div class="hero-content container">
        <div class="hero-text-wrapper">
          <div class="hero-badge" :class="{ 'fade-in': animate }">
            <span class="badge-icon">👑</span>
            <span class="badge-text"
              >Kerala's Premier Distribution Partner</span
            >
          </div>

          <h1 class="hero-title" :class="{ 'slide-up': animate }">
            Elevating <span class="gradient-text">Baking Excellence</span>
          </h1>

          <p class="hero-subtitle" :class="{ 'slide-up-delay': animate }">
            Supplying premium ingredients and equipment to passionate bakers and
            commercial kitchens since 2020.
          </p>

          <div class="hero-cta-group" :class="{ 'fade-in-delay': animate }">
            <button class="btn-primary" @click="scrollToProducts">
              <span>View Catalog</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="btn-icon"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
            <button class="btn-secondary" @click="scrollToAbout">
              <span>Our Story</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Floating Stats Bar -->
      <div class="stats-bar container" :class="{ 'slide-up-late': animate }">
        <div v-for="(stat, index) in stats" :key="index" class="stat-item">
          <div class="stat-number">{{ stat.number }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <!-- Featured Categories Section -->
    <section class="section categories-section">
      <div class="container">
        <div class="section-header text-center" v-animate-on-scroll>
          <span class="section-badge">Our Selection</span>
          <h2 class="section-title">Premium Categories</h2>
          <p class="section-desc">
            Everything you need to create your masterpiece
          </p>
        </div>

        <div class="categories-grid">
          <div
            v-for="(cat, index) in categories"
            :key="index"
            class="category-card"
            v-animate-on-scroll
            :style="{ transitionDelay: `${index * 100}ms` }"
          >
            <div class="category-bg" :style="cat.style"></div>
            <div class="category-content">
              <span class="category-icon">{{ cat.icon }}</span>
              <h3 class="category-name">{{ cat.name }}</h3>
              <button class="btn-link">Explore →</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About Section -->
    <section id="about" class="section about-section">
      <div class="container">
        <div class="about-grid">
          <div class="about-content" v-animate-on-scroll>
            <span class="section-badge">Who We Are</span>
            <h2 class="section-title">
              Passion for Quality,<br />Dedication to Service
            </h2>
            <p class="about-text">
              At Cochin Distributors, we see ourselves as more than just
              suppliers; we are partners in your baking journey. Founded in
              2020, we have grown to become Kerala's most trusted source for
              professional baking supplies.
            </p>
            <div class="feature-list">
              <div
                v-for="(feature, i) in features"
                :key="i"
                class="feature-item"
              >
                <div class="feature-icon-box">{{ feature.icon }}</div>
                <div>
                  <h4 class="feature-title-sm">{{ feature.title }}</h4>
                  <p class="feature-desc-sm">{{ feature.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="about-visual" v-animate-on-scroll>
            <div class="visual-card main-card">
              <div class="card-gradient gradient-blue"></div>
              <span class="visual-icon">🏭</span>
              <span>Large Scale Warehousing</span>
            </div>
            <div class="visual-card float-card">
              <div class="card-gradient gradient-gold"></div>
              <div class="rating-box">
                <span class="stars">⭐⭐⭐⭐⭐</span>
                <span class="rating-text">Top Rated Service</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="section why-us-section">
      <div class="container">
        <div class="section-header text-center" v-animate-on-scroll>
          <span class="section-badge">Why Choose Us</span>
          <h2 class="section-title">The Cochin Advantage</h2>
        </div>

        <div class="values-grid">
          <div
            v-for="(val, i) in values"
            :key="i"
            class="value-card"
            v-animate-on-scroll
          >
            <div class="value-icon-wrapper">{{ val.icon }}</div>
            <h3 class="value-title">{{ val.title }}</h3>
            <p class="value-text">{{ val.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="section testimonials-section">
      <div class="container">
        <div class="section-header text-center" v-animate-on-scroll>
          <span class="section-badge">Testimonials</span>
          <h2 class="section-title">Trusted by the Best</h2>
        </div>

        <div class="testimonials-grid">
          <div
            v-for="(testim, i) in testimonials"
            :key="i"
            class="testimonial-card"
            v-animate-on-scroll
          >
            <div class="quote-icon">"</div>
            <p class="testimonial-text">{{ testim.text }}</p>
            <div class="testimonial-author">
              <div class="author-avatar">{{ testim.initials }}</div>
              <div class="author-info">
                <h4 class="author-name">{{ testim.name }}</h4>
                <span class="author-role">{{ testim.role }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter / CTA -->
    <section class="section newsletter-section">
      <div class="container">
        <div class="newsletter-box" v-animate-on-scroll>
          <div class="newsletter-content">
            <h2 class="newsletter-title">Ready to Elevate Your Baking?</h2>
            <p class="newsletter-desc">
              Join our network and get access to exclusive products and
              wholesale prices.
            </p>
          </div>
          <div class="newsletter-action">
            <button class="btn-primary btn-large" @click="scrollToProducts">
              Get Started Now
            </button>
          </div>
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
      stats: [
        { number: "500+", label: "Premium Products" },
        { number: "1k+", label: "Happy Partners" },
        { number: "24/7", label: "Expert Support" },
        { number: "100%", label: "Quality Guarantee" },
      ],
      categories: [
        {
          name: "Bakery Fats & Margarines",
          icon: "🧈",
          style: {
            background: "linear-gradient(135deg, #FFEFBA 0%, #FFFFFF 100%)",
          },
        },
        {
          name: "Chocolates & Fillings",
          icon: "🍫",
          style: {
            background: "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",
          },
        },
        {
          name: "Yeast & Improvers",
          icon: "🍞",
          style: {
            background: "linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)",
          },
        },
        {
          name: "Cake Premixes",
          icon: "🎂",
          style: {
            background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
          },
        },
      ],
      features: [
        {
          icon: "⚡",
          title: "Fast Delivery",
          desc: "Same-day dispatch for orders within city limits.",
        },
        {
          icon: "🛡️",
          title: "Quality Assured",
          desc: "Every product is vetted for professional standards.",
        },
        {
          icon: "💰",
          title: "Wholesale Pricing",
          desc: "Competitive rates designed for business growth.",
        },
      ],
      values: [
        {
          icon: "🤝",
          title: "Reliability",
          text: "We deliver on our promises, every single time.",
        },
        {
          icon: "📦",
          title: "Wide Range",
          text: "From basics to specialty items, we stock it all.",
        },
        {
          icon: "💡",
          title: "Expertise",
          text: "Our team understands baking and helps you choose right.",
        },
      ],
      testimonials: [
        {
          text: "Cochin Distributors transformed how we source ingredients. The quality is unmatched.",
          name: "Sarah J.",
          role: "Home Baker",
          initials: "SJ",
        },
        {
          text: "Reliable delivery and great customer support. Highly recommended for commercial needs.",
          name: "Rahul M.",
          role: "Bakery Owner",
          initials: "RM",
        },
        {
          text: "The best selection of premium chocolate compounds in the market.",
          name: "Anjali P.",
          role: "Pastry Chef",
          initials: "AP",
        },
      ],
    };
  },
  mounted() {
    setTimeout(() => {
      this.animate = true;
    }, 100);
  },
  methods: {
    scrollToProducts() {
      this.$router.push("/products");
    },
    scrollToAbout() {
      document.getElementById("about").scrollIntoView({ behavior: "smooth" });
    },
    getParticleStyle() {
      return {
        top: Math.random() * 100 + "%",
        left: Math.random() * 100 + "%",
        animationDelay: Math.random() * 5 + "s",
        animationDuration: 10 + Math.random() * 20 + "s",
      };
    },
  },
  directives: {
    animateOnScroll: {
      mounted(el) {
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                el.classList.add("is-visible");
                observer.unobserve(el);
              }
            });
          },
          { threshold: 0.1 }
        );
        observer.observe(el);
      },
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

:root {
  --primary: #1e3a8a; /* Royal Blue */
  --primary-dark: #172554;
  --accent: #d97706; /* Gold/Amber */
  --accent-light: #fbbf24;
  --surface: #ffffff;
  --surface-alt: #f8fafc;
  --text-main: #0f172a;
  --text-body: #475569;
  --border: #e2e8f0;
}

.home-page {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: #0f172a;
  background-color: #ffffff;
  overflow-x: hidden;
}

/* --- Utilities --- */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 6rem 0;
}

.text-center {
  text-align: center;
}

.section-header {
  margin-bottom: 4rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.section-badge {
  display: inline-block;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #1e3a8a;
  background: #eff6ff;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.2;
  margin-bottom: 1rem;
}

.section-desc {
  font-size: 1.125rem;
  color: #64748b;
  line-height: 1.6;
}

/* --- Animations --- */
.fade-in {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.slide-up {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.slide-up-delay {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.fade-in-delay {
  opacity: 1 !important;
  transform: translateY(0) !important;
}
.slide-up-late {
  opacity: 1 !important;
  transform: translateY(0) !important;
}

[v-animate-on-scroll] {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

[v-animate-on-scroll].is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* --- Hero Section --- */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
  overflow: hidden;
  padding-top: 4rem; /* For fixed nav if any */
  padding-bottom: 6rem;
}

.hero-bg-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
      circle at top right,
      rgba(251, 191, 36, 0.1),
      transparent 40%
    ),
    radial-gradient(
      circle at bottom left,
      rgba(30, 58, 138, 0.2),
      transparent 40%
    );
  z-index: 1;
}

.hero-particles {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: float 20s infinite linear;
}

@keyframes float {
  0% {
    transform: translateY(0) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-100px) translateX(20px);
    opacity: 0;
  }
}

.hero-content {
  position: relative;
  z-index: 10;
  width: 100%;
}

.hero-text-wrapper {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1.25rem;
  border-radius: 9999px;
  margin-bottom: 2rem;
  color: #fff;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
}

.badge-text {
  font-size: 0.9rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: clamp(3rem, 6vw, 4.5rem);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  letter-spacing: -0.02em;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.2s;
}

.gradient-text {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #cbd5e1;
  margin-bottom: 3rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.3s;
}

.hero-cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease 0.4s;
}

.btn-primary {
  background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
  color: #ffffff;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  background: linear-gradient(135deg, #b45309 0%, #92400e 100%);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* --- Floating Stats Bar --- */
.stats-bar {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, 50%); /* Half overlap */
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: space-between;
  padding: 2.5rem 4rem;
  width: calc(100% - 3rem);
  max-width: 1000px;
  z-index: 20;
  opacity: 0;
  /* Transform handled by slide-up-late class which will override translate */
  transition: all 0.8s ease 0.6s;
}

/* Fix for animation override */
.stats-bar.slide-up-late {
  transform: translate(-50%, 50%) !important;
  opacity: 1 !important;
}

.stat-item {
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* --- Categories Section --- */
.categories-section {
  padding-top: 10rem; /* Space for stats bar */
  background: #f8fafc;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.category-card {
  position: relative;
  border-radius: 24px;
  overflow: hidden;
  height: 300px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: translateY(-5px);
}

.category-bg {
  position: absolute;
  inset: 0;
  transition: transform 0.5s ease;
}

.category-card:hover .category-bg {
  transform: scale(1.1);
}

.category-content {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  text-align: center;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(4px);
}

.category-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.category-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 1rem;
}

.btn-link {
  background: transparent;
  border: none;
  color: #d97706;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
}

/* --- About Section --- */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.feature-list {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feature-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.feature-icon-box {
  width: 48px;
  height: 48px;
  background: #eff6ff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #1e3a8a;
  flex-shrink: 0;
}

.feature-title-sm {
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}
.feature-desc-sm {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.about-visual {
  position: relative;
  height: 500px;
}

.visual-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  overflow: hidden;
}

.main-card {
  width: 80%;
  height: 80%;
  top: 0;
  left: 0;
  z-index: 1;
}
.float-card {
  width: 60%;
  height: 60%;
  bottom: 0;
  right: 0;
  z-index: 2;
  background: #ffffff;
}

.card-gradient {
  position: absolute;
  inset: 0;
  opacity: 0.1;
}
.gradient-blue {
  background: radial-gradient(circle at top right, #1e3a8a, transparent);
}
.gradient-gold {
  background: radial-gradient(circle at bottom left, #f59e0b, transparent);
}

.visual-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.rating-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.rating-text {
  font-weight: 700;
  color: #1e3a8a;
}

/* --- Why Choose Us --- */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.value-card {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.value-card:hover {
  border-color: #f59e0b;
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.value-icon-wrapper {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}
.value-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #0f172a;
}
.value-text {
  color: #64748b;
  line-height: 1.6;
}

/* --- Testimonials --- */
.testimonials-section {
  background: #0f172a;
  color: white;
}
.testimonials-section .section-title {
  color: white;
}
.testimonials-section .section-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #fbbf24;
}
.testimonials-section .section-desc {
  color: #94a3b8;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 20px;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: 1rem;
  right: 2rem;
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.05);
  font-family: serif;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #e2e8f0;
  margin-bottom: 2rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #78350f;
}

.author-name {
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.author-role {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* --- Newsletter --- */
.newsletter-box {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 32px;
  padding: 4rem;
  text-align: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.newsletter-content {
  text-align: left;
  max-width: 500px;
}
.newsletter-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}
.newsletter-desc {
  font-size: 1.1rem;
  color: #bfdbfe;
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.1rem;
  background: #ffffff;
  color: #1e3a8a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.btn-large:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  color: #1e3a8a; /* Ensure text color stays readable */
}

/* --- Responsive --- */
@media (max-width: 1024px) {
  .about-grid,
  .values-grid {
    grid-template-columns: 1fr;
  }
  .about-visual {
    display: none;
  } /* Simplify for tablet/mobile */
  .stats-bar {
    position: relative;
    width: 100%;
    top: auto;
    left: auto;
    transform: none;
    bottom: auto;
    margin-top: -3rem;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }
  .stats-bar.slide-up-late {
    transform: none !important;
    opacity: 1 !important;
  }
}

@media (max-width: 768px) {
  .hero {
    padding-top: 6rem;
    padding-bottom: 4rem;
    min-height: auto;
  }

  .hero-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .hero-cta-group {
    flex-direction: column;
    padding: 0 1rem;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .newsletter-box {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .newsletter-content {
    text-align: center;
  }

  .section {
    padding: 3rem 0;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .stats-bar {
    position: static;
    transform: none !important;
    width: 100%;
    max-width: none;
    border-radius: 0;
    margin-top: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 2rem 1rem;
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .categories-section {
    padding-top: 3rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .category-card {
    height: 250px;
  }

  .about-visual {
    display: none;
  }

  .feature-item {
    text-align: left;
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .testimonial-card {
    padding: 1.5rem;
  }

  .quote-icon {
    font-size: 2.5rem;
  }
}
</style>
