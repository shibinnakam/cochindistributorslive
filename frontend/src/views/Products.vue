<template>
  <div class="products-page">
    <!-- Header Section -->
    <section class="products-header">
      <div class="header-overlay"></div>
      <h1 class="page-title">Our <span class="accent-font">Menu</span></h1>
    </section>

    <!-- Dynamic Menu Section -->
    <section id="products-section" class="menu-section container">
      <div class="menu-header">
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
            <div class="product-main-info">
              <h3 class="product-name">{{ product.name }}</h3>
              <p class="product-desc">{{ product.description }}</p>
            </div>
            <div class="product-actions">
              <span class="product-price">₹{{ product.discountPrice }}</span>
              <button class="btn-order" @click="orderProduct()">Order Now</button>
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
  name: "ProductsPage",
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
        "Pizza": "🍕",
        "Snacks": "🍕",
        "Soft Drinks": "🥤"
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
    window.scrollTo(0, 0);
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
        console.error("Error fetching products:", err);
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
    orderProduct() {
      const token = localStorage.getItem("token");
      if (!token) {
        this.$router.push("/login");
      } else {
        this.$router.push("/user");
      }
    }
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
.products-page {
  font-family: "Plus Jakarta Sans", sans-serif;
  color: #5d4037;
  background-color: #fffdfa;
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.accent-font {
  font-family: "Dancing Script", cursive;
  color: #efa962;
}

/* --- Header Section --- */
.products-header {
  height: 40vh;
  position: relative;
  background-image: url("https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=1920");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 80px;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(62, 39, 35, 0.4);
}

.page-title {
  position: relative;
  z-index: 1;
  font-size: 4rem;
  color: white;
  font-weight: 800;
  text-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

/* --- Dynamic Menu Section --- */
.menu-section {
  padding: 8rem 0;
}

.section-subtitle {
  text-align: center;
  color: #8d6e63;
  max-width: 650px;
  margin: 0 auto 5rem;
  font-size: 1.2rem;
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

/* Product Grid */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
  display: flex;
  flex-direction: column;
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
  height: 280px;
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
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 1.5rem;
  color: #3e2723;
  margin-bottom: 0.5rem;
  font-weight: 700;
}

.product-desc {
  font-size: 0.95rem;
  color: #8d6e63;
  line-height: 1.6;
  margin-bottom: 2rem;
  min-height: 3rem;
}

.product-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f5f5f5;
  padding-top: 1.5rem;
}

.product-price {
  font-size: 1.8rem;
  font-weight: 800;
  color: #efa962;
}

.btn-order {
  background: #3e2723;
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.9rem;
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

@media (max-width: 768px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
  .category-tabs {
    gap: 1rem;
  }
  .page-title {
    font-size: 3rem;
  }
}
</style>
