<template>
  <div class="marketplace-layout">
    <!-- Slim Navbar -->
    <nav class="top-nav">
      <div class="top-nav-container">
        <div class="brand-section" @click="$router.push('/')">
          <img src="@/assets/logo.jpeg" alt="Logo" class="nav-logo" />
          <span class="brand-title">Cochin Distributors</span>
        </div>

        <div class="top-nav-center">
          <span class="phone-link">📞 (450) 678 099 67</span>
        </div>

        <div class="top-nav-actions">
          <div class="nav-extra-info">
            <span class="wallet-balance">💰 ₹{{ walletBalance }}</span>
          </div>
          <div class="user-action dropdown-trigger desktop-only">
            <span class="btn-signin">👤 {{ userName || "SIGN IN" }}</span>
            <div class="nav-dropdown">
              <a href="#" @click.prevent="openUserTab('profile')">My Profile</a>
              <a href="#" @click.prevent="openUserTab('wallet')">My Wallet</a>
              <a href="#" @click.prevent="openUserTab('orders')">My Orders</a>
              <a href="#" @click.prevent="logout">Logout</a>
            </div>
          </div>
          <div class="cart-btn" @click="showCart = true">
            <span>🛒</span>
            <span class="badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
          <button class="hamburger" @click="isMobileMenuOpen = true">☰</button>
        </div>
      </div>
    </nav>

    <!-- Mobile Drawer -->
    <div
      class="mobile-drawer-overlay"
      :class="{ active: isMobileMenuOpen }"
      @click="isMobileMenuOpen = false"
    ></div>
    <aside class="mobile-drawer" :class="{ active: isMobileMenuOpen }">
      <div class="drawer-header">
        <h3>Menu</h3>
        <button class="close-drawer" @click="isMobileMenuOpen = false">✕</button>
      </div>
      <div class="drawer-user-info">
        <div class="drawer-avatar">👤</div>
        <div class="drawer-details">
          <span class="drawer-name">{{ userName || "User" }}</span>
          <span class="drawer-balance">Balance: ₹{{ walletBalance }}</span>
        </div>
      </div>
      <nav class="drawer-nav">
        <a href="#" @click.prevent="openUserTab('profile')">👤 My Profile</a>
        <a href="#" @click.prevent="openUserTab('wallet')">💰 My Wallet</a>
        <a href="#" @click.prevent="openUserTab('orders')">📦 My Orders</a>
        <a href="#" @click.prevent="logout" class="logout-link">🚪 Logout</a>
      </nav>
    </aside>

    <!-- Hero Section -->
    <header class="hero-section">
      <div class="hero-container">
        <h1>Product directory</h1>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content-wrapper">
      <div class="content-container">
        <!-- Floating Filter Bar -->
        <div class="search-filter-ribbon">
          <div class="ribbon-item search-box">
            <span class="icon">📍</span>
            <input
              type="text"
              placeholder="Search products..."
              v-model="searchQuery"
            />
            <button class="img-search-btn" @click="triggerImageUpload">
              📷
            </button>
          </div>
          <div class="ribbon-item select-box">
            <select v-model="selectedCategory">
              <option :value="null">All Categories</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="ribbon-item select-box">
            <select disabled>
              <option>All Locations</option>
            </select>
          </div>
          <input
            type="file"
            ref="imageInput"
            @change="handleImageSearch"
            accept="image/*"
            style="display: none"
          />
        </div>

        <div class="layout-body">
          <!-- Mobile Filter Toggle -->
          <button class="mobile-filter-btn" @click="isFilterOpen = true">
            🔍 Filters & Sorting
          </button>

          <!-- Sidebar Overlay -->
          <div
            class="filter-overlay"
            :class="{ active: isFilterOpen }"
            @click="isFilterOpen = false"
          ></div>

          <!-- Sidebar -->
          <aside class="filter-sidebar" :class="{ 'mobile-open': isFilterOpen }">
            <div class="sidebar-header">
              <div class="filter-title">
                <span class="icon">📊</span>
                <span>FILTER</span>
              </div>
              <div class="sidebar-actions">
                <button class="btn-reset" @click="resetFilters">Reset</button>
                <button class="btn-close-filter" @click="isFilterOpen = false">
                  ✕
                </button>
              </div>
            </div>

            <div class="filter-section">
              <h4 @click="toggleSection('delivery')">
                Delivery method
                <span>{{ sectionOpen.delivery ? "−" : "+" }}</span>
              </h4>
              <div class="section-content" v-show="sectionOpen.delivery">
                <label><input type="checkbox" /> Delivery</label>
                <label><input type="checkbox" /> Pickup</label>
              </div>
            </div>

            <div class="filter-section">
              <h4 @click="toggleSection('categories')">
                Categories <span>{{ sectionOpen.categories ? "−" : "+" }}</span>
              </h4>
              <div class="section-content" v-show="sectionOpen.categories">
                <label v-for="cat in categories" :key="cat._id">
                  <input
                    type="checkbox"
                    :checked="selectedCategory === cat._id"
                    @change="selectCategory(cat)"
                  />
                  {{ cat.name }}
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h4>Additional criterion <span>+</span></h4>
            </div>
          </aside>

          <!-- Listing Area -->
          <section class="listing-area">
            <div class="listing-toolbar">
              <p>
                Total found: <b>{{ filteredProducts.length }}</b> products
              </p>
              <div class="sorting-controls">
                <span>Sorting</span>
                <select>
                  <option>Featured</option>
                </select>
              </div>
            </div>

            <div v-if="loading" class="listing-loading">
              <div class="loader-spinner"></div>
            </div>

            <div
              v-else-if="filteredProducts.length === 0"
              class="listing-empty"
            >
              <p>No products match your search.</p>
            </div>

            <div v-else class="product-marketplace-grid">
              <div
                v-for="product in filteredProducts"
                :key="product._id"
                class="marketplace-product-card"
              >
                <div class="card-thumb">
                  <span class="top-tag">top</span>
                  <img
                    :src="getImageUrl(product.image || product.imageFront)"
                    :alt="product.name"
                  />
                  <div class="brand-spot">
                    <img src="@/assets/logo.jpeg" alt="Brand" />
                  </div>
                </div>

                <div class="card-body">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <div class="product-rating">
                    <div class="stars">
                      <span
                        v-for="star in 5"
                        :key="star"
                        :class="{
                          filled:
                            star <= Math.round(product.averageRating || 0),
                        }"
                        class="star"
                      >
                        ★
                      </span>
                    </div>
                    <span class="count">({{ product.ratingCount || 0 }})</span>
                  </div>
                  <div class="product-labels">
                    <span
                      >{{
                        product.category ? product.category.name : "Wholesale"
                      }}
                      • Bulk • Direct</span
                    >
                  </div>
                  <p class="product-teaser">
                    {{
                      product.description ||
                      "Premium distribution quality product for businesses."
                    }}
                  </p>

                  <div class="product-stats">
                    <div class="stat">
                      <span class="label">Min order</span>
                      <span class="value">₹{{ product.discountPrice }}</span>
                    </div>
                  </div>

                  <div class="card-footer">
                    <button
                      class="btn-view-more"
                      @click.stop="toggle3D(product._id)"
                    >
                      more <span>→</span>
                    </button>
                    <button class="btn-buy" @click.stop="addToCart(product)">
                      Add to Cart
                    </button>
                  </div>
                </div>

                <!-- 3D View Modal -->
                <div
                  v-if="active3DProductId === product._id"
                  class="view3d-modal"
                >
                  <div class="modal-content-3d">
                    <div class="visualizer-section">
                      <ThreeDBox
                        :image="getImageUrl(product.image)"
                        :image-front="getImageUrl(product.imageFront)"
                        :image-side="getImageUrl(product.imageSide)"
                        :image-back="getImageUrl(product.imageBack)"
                        :image-top="getImageUrl(product.imageTop)"
                        :image-bottom="getImageUrl(product.imageBottom)"
                        :model3D="getImageUrl(product.model3D)"
                        :shape="product.shape"
                      />
                    </div>

                    <div class="details-section">
                      <h3>Product Reviews</h3>
                      <div
                        v-if="productReviews.length === 0"
                        class="no-reviews"
                      >
                        No reviews yet.
                      </div>
                      <div v-else class="reviews-list-mini">
                        <div
                          v-for="rev in productReviews"
                          :key="rev._id"
                          class="mini-review-card"
                        >
                          <div class="rev-header">
                            <span class="rev-user">{{ rev.user.name }}</span>
                            <div class="rev-stars">
                              <span
                                v-for="s in 5"
                                :key="s"
                                :class="{ filled: s <= rev.rating }"
                                class="star"
                                >★</span
                              >
                            </div>
                          </div>
                          <p class="rev-comment">{{ rev.comment }}</p>
                          <span class="rev-date">
                            {{ formatDate(rev.createdAt) }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    class="close-modal"
                    @click.stop="toggle3D(product._id)"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- Pagination Indicator (Visual only) -->
            <div class="pagination-visual">
              <div class="dot-loader">
                <span></span><span></span><span></span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <ProfilePage v-if="showProfile" @close="showProfile = false" />
    <CartPage
      v-if="showCart"
      @close="showCart = false"
      @cart-updated="cartCount = $event"
      @show-scratch-card="handleShowScratchCard"
    />
    <ChatBot :categories="categories" :products="products" />
    <WalletPage v-if="showWallet" @close="showWallet = false" />
    <OrdersPage v-if="showOrders" @close="showOrders = false" />
    <ScratchCard
      v-if="showScratchCard"
      :orderId="scratchCardOrderId"
      @close="closeScratchCard"
      @wallet-updated="updateWalletBalance"
    />

    <!-- Footer -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-col branding-col">
          <img src="@/assets/logo.jpeg" alt="Logo" class="footer-logo" />
          <h3>Cochin Distributors</h3>
          <p>Leading wholesale distribution network.</p>
        </div>
        <div class="footer-col">
          <h4>Support</h4>
          <a href="#">Help Center</a>
          <a href="#">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Terms of Service</a>
        </div>
      </div>
      <div class="footer-btm">
        <p>&copy; 2024 Cochin Distributors. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script>
import axios from "@/utils/axios";
import socket from "@/socket.js";
import ThreeDBox from "@/components/ThreeDBox.vue";
import ChatBot from "@/components/ChatBot.vue";
import ScratchCard from "@/components/ScratchCard.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import CartPage from "@/views/CartPage.vue";
import WalletPage from "@/views/WalletPage.vue";
import OrdersPage from "@/views/OrdersPage.vue";

export default {
  name: "UserPage",
  components: {
    ThreeDBox,
    ChatBot,
    ScratchCard,
    ProfilePage,
    CartPage,
    WalletPage,
    OrdersPage,
  },
  data() {
    return {
      products: [],
      categories: [],
      loading: false,
      searchQuery: "",
      userName: "User",
      active3DProductId: null,
      cartCount: 0,
      showProfile: false,
      showCart: false,
      showWallet: false,
      showOrders: false,
      showWelcome: true,
      isMobileMenuOpen: false,
      isFilterOpen: false,
      selectedCategory: null,
      showScratchCard: false,
      scratchCardOrderId: null,
      walletBalance: 0,
      sectionOpen: {
        delivery: true,
        categories: true,
      },
      productReviews: [],
    };
  },
  computed: {
    filteredProducts() {
      let result = this.products;

      // Filter by Category
      if (this.selectedCategory) {
        result = result.filter(
          (p) => p.category && p.category._id === this.selectedCategory
        );
      }

      // Filter by Search Query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
      }

      return result;
    },
  },
  mounted() {
    this.fetchProducts();
    this.fetchCategories();
    this.fetchCart();
    this.fetchWalletBalance();

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // Assuming user object has a name property, otherwise fallback to email or "User"
        this.userName =
          user.name || (user.email ? user.email.split("@")[0] : "User");
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    // Socket listeners for real-time updates
    socket.on("productAdded", (data) => {
      this.products.unshift(data.product);
    });

    socket.on("productUpdated", (data) => {
      const index = this.products.findIndex((p) => p._id === data.product._id);
      if (index !== -1) {
        this.$set(this.products, index, data.product);
      }
    });

    socket.on("productDeleted", (data) => {
      this.products = this.products.filter((p) => p._id !== data.productId);
    });

    socket.on("categoryAdded", (data) => {
      this.categories.push(data.category);
    });

    socket.on("categoryUpdated", (data) => {
      const index = this.categories.findIndex(
        (c) => c._id === data.category._id
      );
      if (index !== -1) {
        this.$set(this.categories, index, data.category);
      }
    });

    socket.on("categoryDeleted", (data) => {
      this.categories = this.categories.filter(
        (c) => c._id !== data.categoryId
      );
    });

    socket.on("cartUpdated", (data) => {
      this.cartCount = data.cart.length;
    });

    socket.on("walletUpdated", (data) => {
      this.walletBalance = data.balance;
      if (this.showWallet) {
        // Emit to WalletPage component if needed
        this.$emit("wallet-updated", data.balance);
      }
    });

    socket.on("orderPlaced", (data) => {
      // Handle new order placed
      // Maybe show a notification or refresh orders
      if (this.showOrders) {
        // Refresh orders list
        this.$emit("order-placed", data.order);
      }
    });

    socket.on("orderStatusUpdate", (data) => {
      // Handle order status update
      if (this.showOrders) {
        this.$emit("order-status-updated", data);
      }
    });
  },
  beforeUnmount() {
    // Remove socket listeners
    socket.off("productAdded");
    socket.off("productUpdated");
    socket.off("productDeleted");
    socket.off("categoryAdded");
    socket.off("categoryUpdated");
    socket.off("categoryDeleted");
    socket.off("cartUpdated");
    socket.off("walletUpdated");
    socket.off("orderPlaced");
    socket.off("orderStatusUpdate");
  },
  methods: {
    triggerImageUpload() {
      this.$refs.imageInput.click();
    },
    async handleImageSearch(event) {
      const file = event.target.files[0];
      if (!file) return;

      const formData = new FormData();
      formData.append("image", file);

      this.loading = true;
      try {
        const res = await axios.post("/api/products/search-image", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (res.data.success) {
          this.products = res.data.products;
          this.searchQuery = ""; // Clear text search
          this.selectedCategory = null; // Clear category
          // Optional: Show a message if no products found
          if (this.products.length === 0) {
            alert("No similar products found.");
            this.fetchProducts(); // Reset to all products
          }
        }
      } catch (err) {
        console.error("Error searching by image:", err);
        alert("Failed to search by image");
      } finally {
        this.loading = false;
        // Reset input so same file can be selected again if needed
        event.target.value = "";
      }
    },
    async fetchCart() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/cart");
        this.cartCount = res.data.length;
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    },
    async addToCart(product) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login to add items to cart");
          this.$router.push("/login");
          return;
        }
        await axios.post("/api/cart/add", {
          productId: product._id,
          quantity: 10,
        });
        this.fetchCart(); // Update count
        alert("Product added to cart!");
      } catch (err) {
        console.error("Error adding to cart:", err);
        if (err.response && err.response.data && err.response.data.msg) {
          alert(err.response.data.msg);
        } else {
          alert("Failed to add to cart");
        }
      }
    },
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get("/api/products/getproduct");
        if (res.data.success) {
          this.products = res.data.products;
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        this.loading = false;
      }
    },
    async fetchCategories() {
      try {
        const res = await axios.get("/api/categories");
        this.categories = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    },
    getImageUrl(path) {
      if (!path) return null;
      const apiUrl = process.env.VUE_APP_API_URL || window.location.origin;
      return path.startsWith("/") ? `${apiUrl}${path}` : path;
    },
    calculateDiscount(original, discount) {
      if (!original || !discount) return 0;
      return Math.round(((original - discount) / original) * 100);
    },
    toggle3D(productId) {
      if (this.active3DProductId === productId) {
        this.active3DProductId = null;
        this.productReviews = [];
      } else {
        this.active3DProductId = productId;
        this.fetchProductReviews(productId);
      }
    },
    async fetchProductReviews(productId) {
      try {
        const res = await axios.get(`/api/reviews/product/${productId}`);
        if (res.data.success) {
          this.productReviews = res.data.reviews;
        }
      } catch (err) {
        console.error("Error fetching product reviews:", err);
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
    has3DImages(product) {
      return product.model3D || (product.imageFront && product.imageBack);
    },
    async logout() {
      try {
        await axios.post("/api/auth/logout");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.$router.push("/login");
      }
    },
    selectCategory(cat) {
      if (this.selectedCategory === cat._id) {
        this.selectedCategory = null; // Deselect if already selected
      } else {
        this.selectedCategory = cat._id;
      }
    },
    closeScratchCard() {
      this.showScratchCard = false;
      this.scratchCardOrderId = null;
    },
    updateWalletBalance() {
      // Update wallet balance if needed, but since it's not stored here, maybe emit to parent or update local state
      // For now, just close the scratch card
      this.closeScratchCard();
    },
    handleShowScratchCard(orderId) {
      this.scratchCardOrderId = orderId;
      this.showScratchCard = true;
    },
    toggleSection(section) {
      this.sectionOpen[section] = !this.sectionOpen[section];
    },
    resetFilters() {
      this.selectedCategory = null;
      this.searchQuery = "";
    },
    async fetchWalletBalance() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/wallet/balance");
        if (res.data.success) {
          this.walletBalance = res.data.balance;
        }
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      }
    },
    openUserTab(tab) {
      this.isMobileMenuOpen = false;
      if (tab === "profile") this.showProfile = true;
      if (tab === "wallet") this.showWallet = true;
      if (tab === "orders") this.showOrders = true;
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

.marketplace-layout {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  background-color: #f7f9fb;
  min-height: 100vh;
  color: #1f2937;
}

/* Slim Top Nav */
.top-nav {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.top-nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.nav-logo {
  width: 44px;
  height: 44px;
  border-radius: 8px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  letter-spacing: -0.025em;
}

.phone-link {
  color: #f97316;
  font-weight: 600;
  font-size: 1rem;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-extra-info {
  display: flex;
  gap: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #4b5563;
}

.btn-signin {
  font-weight: 700;
  font-size: 0.85rem;
  color: #111827;
  cursor: pointer;
  text-transform: uppercase;
}

.dropdown-trigger {
  position: relative;
}

.nav-dropdown {
  display: none;
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  margin-top: 10px;
  z-index: 100;
}

/* Invisible bridge to prevent dropdown from closing when moving mouse across the gap */
.nav-dropdown::before {
  content: "";
  position: absolute;
  top: -10px;
  left: 0;
  right: 0;
  height: 10px;
  background: transparent;
}

.dropdown-trigger:hover .nav-dropdown {
  display: block;
}

.nav-dropdown a {
  display: block;
  padding: 12px 16px;
  color: #374151;
  text-decoration: none;
  font-size: 0.9rem;
  transition: background 0.2s;
}

.nav-dropdown a:hover {
  background: #f9fafb;
  color: #f97316;
}

.cart-btn {
  position: relative;
  cursor: pointer;
  font-size: 1.4rem;
}

.cart-btn .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f97316;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 10px;
}

.hamburger {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #4b5563;
}

/* Hero Section */
.hero-section {
  background: url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop")
    center/cover no-repeat;
  height: 240px;
  position: relative;
  display: flex;
  align-items: flex-end;
  padding-bottom: 60px;
}

.hero-section::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
  position: relative;
  z-index: 2;
}

.hero-container h1 {
  color: #ffffff;
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0;
}

/* Main Content Wrapper */
.main-content-wrapper {
  margin-top: -35px;
  padding-bottom: 60px;
  position: relative;
  z-index: 10;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Filter Ribbon */
.search-filter-ribbon {
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  padding: 15px;
  gap: 15px;
  margin-bottom: 30px;
}

.ribbon-item {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 15px;
  transition: border-color 0.2s;
}

.ribbon-item:focus-within {
  border-color: #f97316;
}

.ribbon-item .icon {
  margin-right: 10px;
  color: #9ca3af;
}

.ribbon-item input,
.ribbon-item select {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  color: #374151;
}

.img-search-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  opacity: 0.6;
}

/* Layout Body */
.layout-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 30px;
}

/* Sidebar */
.filter-sidebar {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  align-self: start;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #f3f4f6;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 0.9rem;
  color: #111827;
}

.btn-reset {
  background: none;
  border: none;
  color: #f97316;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #111827;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 15px;
}

.filter-section h4 span {
  color: #9ca3af;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-content label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.85rem;
  color: #4b5563;
  cursor: pointer;
}

.section-content input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: #f97316;
}

/* Listings Area */
.listing-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.results-count {
  font-size: 0.9rem;
  color: #4b5563;
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 0.85rem;
  color: #4b5563;
}

.sorting-controls select {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 5px 15px;
  border-radius: 6px;
  outline: none;
}

/* Marketplace Grid */
.product-marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.marketplace-product-card {
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
}

.marketplace-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-thumb {
  height: 200px;
  position: relative;
  background: #f3f4f6;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 10px;
}

.top-tag {
  position: absolute;
  top: 15px;
  left: 15px;
  background: #f97316;
  color: white;
  font-size: 0.65rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}

.brand-spot {
  position: absolute;
  bottom: 0;
  left: 15px;
  transform: translateY(50%);
  width: 50px;
  height: 50px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  padding: 5px;
}

.brand-spot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-body {
  padding: 35px 20px 20px;
}

.product-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #111827;
  margin-bottom: 8px;
}

.product-rating {
  margin-bottom: 12px;
}

.product-rating .stars {
  color: #f97316;
  font-size: 0.9rem;
}

.product-rating .count {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-left: 5px;
}

.product-labels {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 12px;
}

.product-teaser {
  font-size: 0.85rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-stats {
  display: flex;
  gap: 20px;
  padding-top: 15px;
  border-top: 1px solid #f3f4f6;
  margin-bottom: 20px;
}

.stat {
  display: flex;
  flex-direction: column;
}

.stat .label {
  font-size: 0.7rem;
  color: #9ca3af;
  text-transform: capitalize;
}

.stat .value {
  font-size: 0.9rem;
  font-weight: 700;
  color: #374151;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-view-more {
  background: #f97316;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.btn-view-more:hover {
  background: #ea580c;
}

.btn-buy {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-buy:hover {
  background: #e5e7eb;
}

/* 3D Modal & Details */
.view3d-modal {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: 100;
  display: flex;
  flex-direction: column;
}

.modal-content-3d {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
  overflow: hidden;
}

.visualizer-section {
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #e5e7eb;
}

.details-section {
  padding: 30px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.details-section h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.no-reviews {
  color: #9ca3af;
  font-size: 0.9rem;
  text-align: center;
  padding: 40px 0;
}

.reviews-list-mini {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.mini-review-card {
  background: #f9fafb;
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #f3f4f6;
}

.rev-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.rev-user {
  font-weight: 700;
  font-size: 0.85rem;
  color: #374151;
}

.rev-stars {
  font-size: 0.8rem;
  color: #d1d5db;
}

.rev-stars .star.filled {
  color: #fbbf24;
}

.rev-comment {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.4;
  margin-bottom: 8px;
}

.rev-date {
  font-size: 0.75rem;
  color: #9ca3af;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #d1d5db;
}

.star.filled {
  color: #fbbf24;
}

.close-modal {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}

/* Pagination Visual */
.pagination-visual {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.dot-loader {
  display: flex;
  gap: 8px;
}

.dot-loader span {
  width: 8px;
  height: 8px;
  background: #f97316;
  border-radius: 50%;
  opacity: 0.3;
  animation: dotBlink 1.4s infinite;
}

.dot-loader span:nth-child(2) {
  animation-delay: 0.2s;
}
.dot-loader span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBlink {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 1;
  }
}

/* Site Footer */
.site-footer {
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 60px 0 20px;
  margin-top: 40px;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 40px;
  padding: 0 20px 40px;
}

.footer-logo {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.footer-col h3 {
  font-size: 1.2rem;
  margin-bottom: 10px;
}

.footer-col h4 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #9ca3af;
  margin-bottom: 20px;
}

.footer-col a {
  display: block;
  text-decoration: none;
  color: #4b5563;
  font-size: 0.9rem;
  margin-bottom: 10px;
}

.footer-btm {
  border-top: 1px solid #f3f4f6;
  padding-top: 20px;
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
}

/* Loading States */
.listing-loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.loader-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top-color: #f97316;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Responsive */
@media (max-width: 1024px) {
  .layout-body {
    grid-template-columns: 1fr;
  }

  .filter-sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    bottom: 0;
    width: 300px;
    background: white;
    z-index: 2000;
    padding: 30px 20px;
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.1);
    display: block; /* Override previous display: none */
  }

  .filter-sidebar.mobile-open {
    left: 0;
  }

  .filter-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1500;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
  }

  .filter-overlay.active {
    opacity: 1;
    visibility: visible;
  }

  .mobile-filter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    padding: 14px;
    background: #1e293b;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    margin-bottom: 20px;
    cursor: pointer;
  }

  .btn-close-filter {
    display: block;
    background: #f1f5f9;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
  }

  .sidebar-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
}

/* Mobile Drawer Styles */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 2100;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.mobile-drawer-overlay.active {
  opacity: 1;
  visibility: visible;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100vh;
  background: white;
  z-index: 2200;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.mobile-drawer.active {
  right: 0;
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h3 {
  font-weight: 800;
  margin: 0;
}

.close-drawer {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.drawer-user-info {
  padding: 24px;
  background: #f8fafc;
  display: flex;
  gap: 15px;
  align-items: center;
}

.drawer-avatar {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.drawer-details {
  display: flex;
  flex-direction: column;
}

.drawer-name {
  font-weight: 700;
  color: #1e293b;
}

.drawer-balance {
  font-size: 0.8rem;
  color: #64748b;
}

.drawer-nav {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.drawer-nav a {
  text-decoration: none;
  color: #334155;
  font-weight: 600;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background 0.2s;
}

.drawer-nav a:hover {
  background: #f1f5f9;
}

.logout-link {
  color: #ef4444 !important;
  margin-top: 20px;
}

.desktop-only {
  display: block;
}

.mobile-filter-btn {
  display: none;
}

.btn-close-filter {
  display: none;
}

@media (max-width: 768px) {
  .desktop-only {
    display: none;
  }

  .top-nav-center {
    display: none;
  }

  .brand-title {
    font-size: 1.1rem;
  }

  .search-filter-ribbon {
    flex-direction: column;
    padding: 20px;
    gap: 15px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }

  .ribbon-item {
    width: 100%;
    border: 1px solid #e5e7eb !important;
  }

  .hero-section {
    padding: 60px 20px;
  }

  .hero-section h1 {
    font-size: 1.75rem;
  }

  .product-marketplace-grid {
    grid-template-columns: 1fr;
  }

  .modal-content-3d {
    grid-template-columns: 1fr;
    overflow-y: auto;
  }

  .visualizer-section {
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }

  .details-section {
    padding: 20px;
  }

  .btn-view-more,
  .btn-buy {
    flex: 1;
    justify-content: center;
  }
}
</style>
