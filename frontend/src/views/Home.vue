<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <div class="hero-badge" :class="{ 'fade-in': animate }">
          <span class="badge-icon">🏆</span>
          <span>Trusted Distributor Since 2020</span>
        </div>
        <h1 class="hero-title" :class="{ 'slide-up': animate }">
          Welcome to <span class="gradient-text">Cochin Distributors</span>
        </h1>
        <p class="hero-subtitle" :class="{ 'slide-up-delay': animate }">
          Your trusted partner for premium baking supplies and quality products
        </p>
        <div class="hero-cta" :class="{ 'fade-in-delay': animate }">
          <button class="btn-primary" @click="scrollToProducts">
            <span>Explore Products</span>
            <span class="btn-icon">→</span>
          </button>
          <button class="btn-secondary" @click="learnMore">
            <span>Learn More</span>
          </button>
        </div>

        <!-- Stats Section -->
        <div class="stats-container" :class="{ 'fade-in-late': animate }">
          <div class="stat-card">
            <div class="stat-number">500+</div>
            <div class="stat-label">Premium Products</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">1000+</div>
            <div class="stat-label">Happy Customers</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">24/7</div>
            <div class="stat-label">Support Available</div>
          </div>
        </div>
      </div>

      <!-- Animated background -->
      <div class="hero-bg-pattern"></div>
    </section>

    <!-- About Section -->
    <section class="about-section" id="about">
      <div class="container">
        <div class="section-header" :class="{ visible: sectionsVisible.about }">
          <span class="section-label">Who We Are</span>
          <h2 class="section-title">
            Your Trusted Partner in Quality Distribution
          </h2>
          <p class="section-description">
            Delivering excellence across Kerala with premium baking supplies
          </p>
        </div>

        <div class="about-grid">
          <!-- Feature Cards -->
          <div
            v-for="(feature, index) in features"
            :key="index"
            class="feature-card"
            :class="{ visible: sectionsVisible.about }"
            :style="{ transitionDelay: `${index * 0.1}s` }"
          >
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-choose-section">
      <div class="container">
        <div class="why-choose-content">
          <div
            class="why-choose-left"
            :class="{ visible: sectionsVisible.whyChoose }"
          >
            <span class="section-label">Why Choose Us</span>
            <h2 class="section-title">Excellence in Every Delivery</h2>
            <p class="why-choose-text">
              At Cochin Distributors, we believe in delivering the finest
              quality baking products to every kitchen, whether you're a home
              baker or a commercial chef. Our commitment to excellence and
              customer satisfaction sets us apart in the industry.
            </p>

            <div class="value-points">
              <div
                v-for="(value, index) in values"
                :key="index"
                class="value-point"
              >
                <div class="value-check">✓</div>
                <div class="value-text">{{ value }}</div>
              </div>
            </div>

            <button class="btn-contact" @click="contactUs">
              Contact Us Today
            </button>
          </div>

          <div
            class="why-choose-right"
            :class="{ visible: sectionsVisible.whyChoose }"
          >
            <div class="image-grid">
              <div class="grid-item grid-primary">
                <div class="image-placeholder gradient-1">
                  <span class="image-icon">📦</span>
                  <span class="image-label">Quality Products</span>
                </div>
              </div>
              <div class="grid-item grid-secondary">
                <div class="image-placeholder gradient-2">
                  <span class="image-icon">🚚</span>
                  <span class="image-label">Fast Delivery</span>
                </div>
              </div>
              <div class="grid-item grid-tertiary">
                <div class="image-placeholder gradient-3">
                  <span class="image-icon">⭐</span>
                  <span class="image-label">Premium Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-container">
        <div class="cta-content">
          <h2 class="cta-title">Ready to Get Started?</h2>
          <p class="cta-description">
            Join hundreds of satisfied customers who trust us for their
            distribution needs
          </p>
          <button class="btn-cta" @click="getStarted">
            <span>Get Started Now</span>
            <span class="btn-arrow">→</span>
          </button>
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
      sectionsVisible: {
        about: false,
        whyChoose: false,
      },
      features: [
        {
          icon: "🎯",
          title: "Quality Assurance",
          description:
            "Every product goes through rigorous quality checks to ensure you receive only the best.",
        },
        {
          icon: "⚡",
          title: "Fast Delivery",
          description:
            "Quick and reliable delivery service across Kerala, ensuring your orders arrive on time.",
        },
        {
          icon: "💰",
          title: "Competitive Pricing",
          description:
            "Best prices in the market without compromising on quality or service.",
        },
        {
          icon: "🤝",
          title: "Dedicated Support",
          description:
            "Our expert team is always ready to assist you with any queries or concerns.",
        },
      ],
      values: [
        "Premium quality products from trusted brands",
        "Transparent pricing with no hidden costs",
        "On-time delivery guaranteed",
        "Excellent customer service and support",
      ],
    };
  },
  mounted() {
    setTimeout(() => {
      this.animate = true;
    }, 100);

    // Intersection Observer for scroll animations
    this.setupScrollAnimations();
  },
  beforeUnmount() {
    if (this.observer) {
      this.observer.disconnect();
    }
  },
  methods: {
    setupScrollAnimations() {
      const options = {
        threshold: 0.2,
        rootMargin: "0px 0px -100px 0px",
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.dataset.section;
            if (section) {
              this.sectionsVisible[section] = true;
            }
          }
        });
      }, options);

      this.$nextTick(() => {
        const aboutSection = document.querySelector(".about-section");
        const whyChooseSection = document.querySelector(".why-choose-section");

        if (aboutSection) {
          aboutSection.dataset.section = "about";
          this.observer.observe(aboutSection);
        }
        if (whyChooseSection) {
          whyChooseSection.dataset.section = "whyChoose";
          this.observer.observe(whyChooseSection);
        }
      });
    },
    scrollToProducts() {
      // Navigate to products page or scroll to products section
      this.$router.push("/products");
    },
    learnMore() {
      const aboutSection = document.getElementById("about");
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: "smooth" });
      }
    },
    contactUs() {
      // Implement contact functionality
      alert("Contact functionality - you can route to contact page here");
    },
    getStarted() {
      this.$router.push("/products");
    },
  },
};
</script>

<style scoped>
/* Modern CSS Variables */
:root {
  --primary-color: #2563eb;
  --secondary-color: #7c3aed;
  --accent-color: #f59e0b;
  --text-dark: #1f2937;
  --text-light: #6b7280;
  --bg-light: #f9fafb;
  --border-light: #e5e7eb;
  --gradient-1: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-2: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --gradient-3: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  --gradient-hero: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #3730a3 50%,
    #7c2d12 100%
  );
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-page {
  min-height: 100vh;
  background: #fff;
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-hero);
  overflow: hidden;
  padding: 2rem;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 50% 50%,
    rgba(255, 255, 255, 0.1) 0%,
    transparent 50%
  );
  pointer-events: none;
}

.hero-bg-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(
      circle at 20% 30%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    ),
    radial-gradient(
      circle at 80% 70%,
      rgba(255, 255, 255, 0.05) 0%,
      transparent 50%
    );
  animation: float 20s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-20px) scale(1.05);
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  width: 100%;
  text-align: center;
  color: white;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 2rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.8s ease;
}

.hero-badge.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.badge-icon {
  font-size: 1.2rem;
}

.hero-title {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.2s;
}

.hero-title.slide-up {
  opacity: 1;
  transform: translateY(0);
}

.gradient-text {
  background: linear-gradient(90deg, #fff 0%, #fbbf24 50%, #fff 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
  to {
    background-position: 200% center;
  }
}

.hero-subtitle {
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.4s;
}

.hero-subtitle.slide-up-delay {
  opacity: 1;
  transform: translateY(0);
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.6s;
}

.hero-cta.fade-in-delay {
  opacity: 1;
  transform: translateY(0);
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-primary {
  background: white;
  color: var(--primary-color);
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(255, 255, 255, 0.3);
}

.btn-primary .btn-icon {
  transition: transform 0.3s ease;
}

.btn-primary:hover .btn-icon {
  transform: translateX(5px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

/* Stats Container */
.stats-container {
  display: flex;
  gap: 2rem;
  justify-content: center;
  flex-wrap: wrap;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease 0.8s;
}

.stats-container.fade-in-late {
  opacity: 1;
  transform: translateY(0);
}

.stat-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 2rem 3rem;
  text-align: center;
  transition: all 0.3s ease;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-5px);
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #fbbf24;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* About Section */
.about-section {
  padding: 6rem 2rem;
  background: var(--bg-light);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease;
}

.section-header.visible {
  opacity: 1;
  transform: translateY(0);
}

.section-label {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.section-title {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--text-dark);
  font-weight: 800;
  margin-bottom: 1rem;
}

.section-description {
  font-size: 1.1rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
}

.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  transition: all 0.4s ease;
  opacity: 0;
  transform: translateY(30px);
}

.feature-card.visible {
  opacity: 1;
  transform: translateY(0);
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.feature-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 1rem;
}

.feature-description {
  font-size: 1rem;
  color: var(--text-light);
  line-height: 1.7;
}

/* Why Choose Section */
.why-choose-section {
  padding: 6rem 2rem;
  background: white;
}

.why-choose-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 4rem;
  align-items: center;
}

.why-choose-left,
.why-choose-right {
  opacity: 0;
  transform: translateX(-50px);
  transition: all 0.8s ease;
}

.why-choose-right {
  transform: translateX(50px);
}

.why-choose-left.visible,
.why-choose-right.visible {
  opacity: 1;
  transform: translateX(0);
}

.why-choose-text {
  font-size: 1.1rem;
  color: var(--text-light);
  line-height: 1.8;
  margin-bottom: 2rem;
}

.value-points {
  margin-bottom: 2rem;
}

.value-point {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.value-check {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.85rem;
}

.value-text {
  font-size: 1rem;
  color: var(--text-dark);
  line-height: 1.6;
}

.btn-contact {
  padding: 1rem 2.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
}

.btn-contact:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

/* Image Grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.grid-item {
  border-radius: 20px;
  overflow: hidden;
}

.grid-primary {
  grid-column: 1 / -1;
}

.image-placeholder {
  aspect-ratio: 16/9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: white;
  font-weight: 600;
  transition: all 0.3s ease;
}

.grid-primary .image-placeholder {
  aspect-ratio: 21/9;
}

.image-placeholder:hover {
  transform: scale(1.05);
}

.gradient-1 {
  background: var(--gradient-1);
}

.gradient-2 {
  background: var(--gradient-2);
}

.gradient-3 {
  background: var(--gradient-3);
}

.image-icon {
  font-size: 3rem;
}

.image-label {
  font-size: 1.2rem;
}

/* CTA Section */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #1e3a8a 0%, #7c2d12 100%);
}

.cta-container {
  max-width: 1200px;
  margin: 0 auto;
}

.cta-content {
  text-align: center;
  color: white;
}

.cta-title {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 3rem;
  background: white;
  color: var(--primary-color);
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 25px rgba(255, 255, 255, 0.2);
}

.btn-cta:hover {
  transform: translateY(-3px);
  box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
}

.btn-arrow {
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.btn-cta:hover .btn-arrow {
  transform: translateX(5px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero {
    padding: 1.5rem;
  }

  .stats-container {
    gap: 1rem;
  }

  .stat-card {
    padding: 1.5rem 2rem;
  }

  .about-section,
  .why-choose-section,
  .cta-section {
    padding: 4rem 1.5rem;
  }

  .why-choose-content {
    gap: 3rem;
  }

  .image-grid {
    gap: 1rem;
  }
}
</style>
