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

    <!-- Dynamic Menu Section -->
    <section id="products-section" class="menu-section container">
      <div class="menu-header">
        <h2 class="section-title">Our Menu</h2>
        <p class="section-subtitle">
          Browse through our delectable menu of tasty treats and baked goodies.
        </p>
      </div>

      <!-- Category Tabs -->
      <div class="category-tabs">
        <button 
          class="tab-item" 
          :class="{ active: selectedCategory === null }"
          @click="selectedCategory = null"
        >
          All
        </button>
        <button 
          v-for="cat in categories" 
          :key="cat._id" 
          class="tab-item"
          :class="{ active: selectedCategory === cat._id }"
          @click="selectedCategory = cat._id"
        >
          <span class="cat-icon">{{ getCategoryIcon(cat.name) }}</span>
          {{ cat.name }}
        </button>
      </div>

      <!-- Product Grid -->
      <div class="product-grid">
        <div v-if="loading" class="loading-state">
          <div class="loader"></div>
          <p>Freshly baking your menu...</p>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <p>No delicious items found in this category yet.</p>
        </div>
        <div 
          v-else 
          v-for="product in filteredProducts" 
          :key="product._id" 
          class="product-card"
          v-animate-on-scroll
        >
          <div class="product-img-wrapper">
            <img 
              :src="getImageUrl(product.image || product.imageFront)" 
              :alt="product.name"
              class="product-img"
            />
            <div class="product-badge" v-if="product.discountPrice < product.originalPrice">Sale</div>
          </div>
          <div class="product-info">
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-desc">{{ product.description }}</p>
            <div class="product-actions">
              <span class="product-price">₹{{ product.discountPrice }}</span>
              <button class="btn-order" @click="orderProduct(product)">Order Now</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from "@/utils/axios";

export default {
  name: "HomePage",
  data() {
    return {
      products: [],
      categories: [],
      selectedCategory: null,
      loading: false,
      categoryIconMap: {
        "Cookies": "🍪",
        "Cakes": "🍰",
        "Bread": "🍞",
        "Pastry": "🥐",
        "Donuts": "🍩",
        "Cupcakes": "🧁",
        "Burgers": "🍔",
        "Pizza": "🍕"
      }
    };
  },
  computed: {
    filteredProducts() {
      if (!this.selectedCategory) return this.products;
      return this.products.filter(p => p.category && (p.category._id === this.selectedCategory || p.category === this.selectedCategory));
    }
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loading = true;
      try {
        const [prodRes, catRes] = await Promise.all([
          axios.get("/api/products/getproduct"),
          axios.get("/api/categories")
        ]);
        
        if (prodRes.data.success) {
          this.products = prodRes.data.products;
        }
        
        this.categories = Array.isArray(catRes.data) 
          ? catRes.data 
          : (catRes.data.categories || []);
          
      } catch (err) {
        console.error("Error fetching home data:", err);
      } finally {
        this.loading = false;
      }
    },
    getCategoryIcon(name) {
      return this.categoryIconMap[name] || "🍴";
    },
    getImageUrl(path) {
      if (!path) return "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400";
      const apiUrl = process.env.VUE_APP_API_URL || window.location.origin;
      if (path.startsWith("http")) return path;
      return path.startsWith("/") ? `${apiUrl}${path}` : `${apiUrl}/${path}`;
    },
    scrollToProducts() {
      const el = document.getElementById('products-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    },
    orderProduct(product) {
      // Redirect to user page or login if not logged in
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
      } else {
        this.$router.push("/user-page");
      }
    }
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

/* --- Dynamic Menu Section --- */
.menu-section {
  padding: 8rem 0;
}

.category-tabs {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 5rem;
  flex-wrap: wrap;
}

.tab-item {
  padding: 0.8rem 2rem;
  background: white;
  border: 1px solid #e0d5d0;
  border-radius: 50px;
  color: #5d4037;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.tab-item:hover {
  border-color: #efa962;
  color: #efa962;
  transform: translateY(-3px);
}

.tab-item.active {
  background-color: #efa962;
  color: white;
  border-color: #efa962;
  box-shadow: 0 10px 20px rgba(239, 169, 98, 0.2);
}

.cat-icon {
  font-size: 1.2rem;
}

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 3rem;
  min-height: 400px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(74, 55, 45, 0.04);
  transition: all 0.4s ease;
  opacity: 0;
  transform: translateY(30px);
}

.product-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 50px rgba(74, 55, 45, 0.08);
}

.product-img-wrapper {
  position: relative;
  height: 250px;
  overflow: hidden;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.product-card:hover .product-img {
  transform: scale(1.1);
}

.product-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #ff5252;
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
}

.product-info {
  padding: 2rem;
}

.product-name {
  font-size: 1.4rem;
  color: #3e2723;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.product-desc {
  font-size: 0.9rem;
  color: #8d6e63;
  line-height: 1.6;
  margin-bottom: 2rem;
  height: 2.8rem;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 800;
  color: #efa962;
}

.btn-order {
  background: #3e2723;
  color: white;
  border: none;
  padding: 0.7rem 1.2rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
}

.btn-order:hover {
  background: #efa962;
}

/* Loading & States */
.loading-state, .empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 5rem 0;
}

.loader {
  width: 50px;
  height: 50px;
  border: 4px solid #fff5e6;
  border-top: 4px solid #efa962;
  border-radius: 50%;
  margin: 0 auto 2rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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
  .product-grid {
    grid-template-columns: 1fr;
  }
  .category-tabs {
    gap: 0.8rem;
  }
  .tab-item {
    padding: 0.6rem 1.5rem;
  }
}
</style>
