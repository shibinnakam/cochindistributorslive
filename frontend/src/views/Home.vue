<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content container">
        <div class="hero-text">
          <h1 class="hero-title">
            Delicious Baked <br /><span class="accent-font">Goodness</span>
          </h1>
          <p class="hero-subtitle">
            Start your morning the right way with our delicious, homemade bread.
            Shop our huge selection and variety to find the perfect baked
            goodness for your family.
          </p>
          <button class="btn-primary" @click="scrollToProducts">
            Shop Now
          </button>
        </div>
        <div class="hero-image">
          <div class="image-blob"></div>
          <img
            src="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800"
            alt="Fresh Bread"
            class="floating-image"
          />
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section container">
      <h2 class="section-title main-title">Indulge In The Taste</h2>
      <p class="section-subtitle">
        Specially crafted for your delight, using the finest ingredients and
        traditional recipes.
      </p>

      <div class="features-grid">
        <div class="feature-column left">
          <div class="feature-item" v-animate-on-scroll>
            <div class="feature-icon">🥖</div>
            <div class="feature-text">
              <h3>Gluten Free Food</h3>
              <p>
                Everything on our menu has gluten free options for you. Healthy
                food has never tasted better.
              </p>
            </div>
          </div>
          <div class="feature-item" v-animate-on-scroll>
            <div class="feature-icon">🍓</div>
            <div class="feature-text">
              <h3>Fresh Ingredients</h3>
              <p>
                We use only fresh ingredients from local suppliers for our food.
                Get a taste of the best quality.
              </p>
            </div>
          </div>
        </div>

        <div class="feature-image-center" v-animate-on-scroll>
          <img
            src="https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=600"
            alt="Bread Basket"
            class="basket-image"
          />
        </div>

        <div class="feature-column right">
          <div class="feature-item" v-animate-on-scroll>
            <div class="feature-icon">🍞</div>
            <div class="feature-text">
              <h3>Homemade Bread</h3>
              <p>
                Taste the best, oven fresh gourmet homemade bread, cookies,
                cakes, pastries and much more.
              </p>
            </div>
          </div>
          <div class="feature-item" v-animate-on-scroll>
            <div class="feature-icon">🥗</div>
            <div class="feature-text">
              <h3>Healthy & Tasty</h3>
              <p>
                Live a healthier life with freshly baked food that tastes good.
                Get our delicious baked food.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Menu Section Header -->
    <section class="menu-header container">
      <h2 class="section-title">Our Menu</h2>
      <p class="section-subtitle">
        Browse through our delectable menu of tasty treats and baked goodies.
      </p>
    </section>

    <!-- Categories -->
    <section class="categories container">
      <div class="category-list">
        <div v-for="cat in categories" :key="cat.name" class="category-item">
          <div class="cat-circle">{{ cat.icon }}</div>
          <span>{{ cat.name }}</span>
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
      categories: [
        { name: "Cookies", icon: "🍪" },
        { name: "Cakes", icon: "🍰" },
        { name: "Bread", icon: "🍞" },
        { name: "Pastry", icon: "🥐" },
        { name: "Donuts", icon: "🍩" },
      ],
    };
  },
  methods: {
    scrollToProducts() {
      this.$router.push("/user-page"); // Assuming products are on user-page based on history
    },
    scrollToAbout() {
      // Optional: preserve about scroll if needed elsewhere
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
.home-page {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: #5d4037;
  background-color: #fffdfa;
  padding-top: 80px;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.accent-font {
  font-family: "Dancing Script", cursive;
  color: #efa962;
  font-size: 1.25em;
  font-weight: 700;
}

/* --- Hero Section --- */
.hero {
  padding: 6rem 0;
  background: radial-gradient(circle at 85% 20%, #fff5e6 0%, transparent 45%);
}

.hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4rem;
}

.hero-text {
  flex: 1.2;
}

.hero-title {
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 2rem;
  color: #3e2723;
}

.hero-subtitle {
  font-size: 1.15rem;
  color: #8d6e63;
  line-height: 1.8;
  margin-bottom: 3rem;
  max-width: 550px;
}

.btn-primary {
  background-color: #efa962;
  color: white;
  border: none;
  padding: 1.1rem 3rem;
  border-radius: 4px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  box-shadow: 0 10px 20px rgba(239, 169, 98, 0.2);
}

.btn-primary:hover {
  background-color: #e69642;
  transform: translateY(-3px);
  box-shadow: 0 15px 30px rgba(239, 169, 98, 0.4);
}

.hero-image {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
}

.image-blob {
  position: absolute;
  width: 130%;
  height: 130%;
  background: #fff5e6;
  border-radius: 50% 50% 50% 50% / 60% 40% 60% 40%;
  z-index: 0;
  top: -15%;
  left: -15%;
  animation: blobMorph 15s infinite alternate;
}

@keyframes blobMorph {
  0% {
    border-radius: 50% 50% 50% 50% / 60% 40% 60% 40%;
  }
  100% {
    border-radius: 40% 60% 45% 55% / 50% 50% 50% 50%;
  }
}

.floating-image {
  position: relative;
  z-index: 1;
  width: 110%;
  max-width: 550px;
  border-radius: 20px;
  transform: rotate(-3deg);
  box-shadow: 30px 30px 80px rgba(0, 0, 0, 0.08);
  transition: transform 0.5s ease;
}

.floating-image:hover {
  transform: rotate(0deg) scale(1.02);
}

/* --- Features --- */
.features-section {
  padding: 8rem 0;
}

.main-title {
  font-size: 3.5rem;
  text-align: center;
  margin-bottom: 1rem;
}

.section-subtitle {
  text-align: center;
  color: #8d6e63;
  max-width: 650px;
  margin: 0 auto 5rem;
  font-size: 1.1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  align-items: center;
  gap: 3rem;
}

.feature-column {
  display: flex;
  flex-direction: column;
  gap: 6rem;
}

.feature-item {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.feature-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.left .feature-item {
  text-align: right;
  flex-direction: row-reverse;
}

.feature-icon {
  font-size: 1.8rem;
  background: white;
  min-width: 65px;
  height: 65px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.feature-text h3 {
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
  color: #3e2723;
  font-weight: 700;
}

.feature-text p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #8d6e63;
}

.basket-image {
  width: 100%;
  border-radius: 50%;
  aspect-ratio: 1;
  object-fit: cover;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.12);
  border: 15px solid white;
}

/* --- Menu & Categories --- */
.menu-header {
  text-align: center;
  margin-top: 4rem;
}

.category-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 4rem;
  padding: 2rem 0 8rem;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-item:hover {
  transform: translateY(-10px);
}

.category-item:hover .cat-circle {
  background-color: #efa962;
  color: white;
  box-shadow: 0 15px 30px rgba(239, 169, 98, 0.3);
}

.cat-circle {
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.category-item span {
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 1.5px;
  color: #5d4037;
}

@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
  }
  .feature-image-center {
    grid-column: span 2;
    order: -1;
    max-width: 400px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
    text-align: center;
  }
  .hero-subtitle {
    margin: 0 auto 3rem;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .feature-image-center {
    grid-column: span 1;
  }
  .left .feature-item {
    text-align: left;
    flex-direction: row;
  }
  .hero-title {
    font-size: 3rem;
  }
  .main-title {
    font-size: 2.8rem;
  }
}
</style>
