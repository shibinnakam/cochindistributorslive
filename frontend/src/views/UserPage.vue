<template>
  <div class="marketplace-layout">
    <!-- Slim Navbar -->
    <nav class="top-nav">
      <div class="top-nav-container">
        <div class="brand-section" @click="$router.push('/')">
          <img src="@/assets/logo.jpeg" alt="Logo" class="nav-logo" />
          <span class="brand-title">Caterway</span>
        </div>

        <div class="top-nav-actions">
          <div class="wallet-badge" @click="openUserTab('wallet')">
            <span class="icon">💰</span>
            <span>₹{{ walletBalance.toLocaleString() }}</span>
          </div>
          <div class="user-action dropdown-trigger desktop-only">
            <button class="btn-user">
              <span>👤 {{ userName || "Sign In" }}</span>
            </button>
            <div class="nav-dropdown">
              <a href="#" @click.prevent="openUserTab('profile')">Profile</a>
              <a href="#" @click.prevent="openUserTab('orders')">Orders</a>
              <a href="#" @click.prevent="logout">Logout</a>
            </div>
          </div>
          <div class="cart-btn" @click="showCart = true">
            <span>🛒</span>
            <span class="badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>
          <button class="hamburger-btn" @click="isMobileMenuOpen = true">☰</button>
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
        <div class="brand-section">
          <img src="@/assets/logo.jpeg" alt="Logo" class="nav-logo" />
          <span class="brand-title">Caterway</span>
        </div>
        <button class="close-drawer" @click="isMobileMenuOpen = false">✕</button>
      </div>
      <div class="drawer-user-info">
        <div class="drawer-avatar">👤</div>
        <div class="drawer-details">
          <span class="drawer-name">{{ userName || "User" }}</span>
          <span class="drawer-balance">Balance: ₹{{ walletBalance.toLocaleString() }}</span>
        </div>
      </div>
      <nav class="drawer-nav">
        <a href="#" @click.prevent="openUserTab('profile')">👤 My Profile</a>
        <a href="#" @click.prevent="openUserTab('wallet')">💰 My Wallet</a>
        <a href="#" @click.prevent="openUserTab('orders')">📦 My Orders</a>
        <a href="#" @click.prevent="logout" class="logout-link">🚪 Logout</a>
      </nav>
    </aside>

    <!-- Hero Section removed for basic layout -->

    <!-- Main Content Area -->
    <main class="main-content-wrapper">
      <div class="content-container">
        <!-- Basic Search Bar -->
        <div class="search-section">
          <div class="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              v-model="searchQuery"
            />
            <button class="btn-search">Search</button>
          </div>
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
          <aside class="sidebar">
            <div class="filter-group">
              <h3>Categories</h3>
              <div class="category-list">
                <div
                  v-for="cat in categories"
                  :key="cat._id"
                  class="category-item"
                  :class="{ active: selectedCategory === cat._id }"
                  @click="selectCategory(cat)"
                >
                  {{ cat.name }}
                </div>
              </div>
              <button class="btn-reset" @click="resetFilters">Reset Filters</button>
            </div>
          </aside>

          <!-- Listing Area -->
          <section class="listing-area">
            <div class="listing-toolbar">
              <p class="query-results">
                The query <b>"{{ searchQuery || 'Directory' }}"</b> total found: <b>{{ filteredProducts.length }}</b> products
              </p>
              <div class="sorting-controls">
                <select>
                  <option>Sorting</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
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

            <div v-else class="product-grid">
              <div
                v-for="product in filteredProducts"
                :key="product._id"
                class="product-card"
                @click="toggle3D(product._id)"
              >
                <div class="product-image">
                  <img
                    :src="getImageUrl(product.image || product.imageFront)"
                    :alt="product.name"
                  />
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-price">₹{{ product.discountPrice }}</p>
                  <p class="product-desc">{{ product.description }}</p>
                  <button class="btn-view">View Details</button>
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

            <div class="pagination-dots">
              <span class="dot active"></span>
              <span class="dot"></span>
              <span class="dot"></span>
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
          <h3>Caterway</h3>
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
        <p>&copy; 2024 Caterway. All rights reserved.</p>
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
      sectionOpen: {},
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* --- Base Layout --- */
@import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600;700&display=swap');

.marketplace-layout {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f9f9f9;
  min-height: 100vh;
  color: #333;
}

/* --- Nav --- */
.top-nav {
  background: #fff;
  border-bottom: 1px solid #ddd;
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.nav-logo {
  height: 35px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.wallet-badge {
  background: #f0f0f0;
  padding: 5px 15px;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
}

.btn-user {
  background: #eee;
  border: none;
  padding: 5px 15px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

/* --- Search --- */
.search-section {
  background: #fff;
  padding: 30px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}

.search-bar {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  gap: 10px;
  padding: 0 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
}

.btn-search {
  background: #007bff;
  color: #fff;
  border: none;
  padding: 0 20px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

/* --- Layout --- */
.layout-body {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 30px;
  padding: 0 20px 50px;
}

/* --- Sidebar --- */
.sidebar {
  background: #fff;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  align-self: start;
}

.filter-group h3 {
  font-size: 1.2rem;
  margin-bottom: 15px;
  padding-bottom: 5px;
  border-bottom: 2px solid #eee;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.category-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.2s;
}

.category-item:hover {
  background: #f0f0f0;
}

.category-item.active {
  background: #007bff;
  color: #fff;
}

.btn-reset {
  margin-top: 20px;
  width: 100%;
  padding: 8px;
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

/* --- Grid --- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.product-card {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.05);
}

.product-image {
  height: 200px;
  background: #fdfdfd;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 5px;
}

.product-price {
  font-size: 1.2rem;
  color: #28a745;
  font-weight: 700;
  margin-bottom: 10px;
}

.product-desc {
  font-size: 0.9rem;
  color: #666;
  height: 3em;
  overflow: hidden;
  margin-bottom: 15px;
}

.btn-view {
  width: 100%;
  padding: 8px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}

/* --- Mobile --- */
@media (max-width: 768px) {
  .layout-body {
    grid-template-columns: 1fr;
  }
}
</style>
