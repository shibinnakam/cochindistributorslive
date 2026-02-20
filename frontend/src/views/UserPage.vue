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
          <!-- Wallet Balance -->
          <div class="wallet-display" @click="openUserTab('wallet')">
            <span class="coin-icon">💰</span>
            <span class="balance-text"
              >₹{{ walletBalance.toLocaleString() }}</span
            >
          </div>

          <!-- User Dropdown -->
          <div class="user-dropdown-container">
            <div class="user-trigger" @click.stop="toggleUserDropdown">
              <span class="avatar-icon">👤</span>
              <span class="user-name-text">{{ userName || "Account" }}</span>
              <span class="dropdown-arrow">▾</span>
            </div>

            <div class="custom-dropdown-menu" v-if="isUserDropdownOpen">
              <div class="dropdown-header">
                <strong>{{ userName }}</strong>
                <span>Balance: ₹{{ walletBalance.toLocaleString() }}</span>
              </div>
              <div class="dropdown-divider"></div>
              <a href="#" @click.prevent="openUserAction('profile')"
                >👤 My Profile</a
              >
              <a href="#" @click.prevent="openUserAction('wallet')"
                >💰 My Wallet</a
              >
              <a href="#" @click.prevent="openUserAction('orders')"
                >📦 My Orders</a
              >
              <div class="dropdown-divider"></div>
              <a href="#" @click.prevent="logout" class="logout-btn"
                >🚪 Logout</a
              >
            </div>
          </div>

          <!-- Cart Icon -->
          <div class="cart-pill" @click="showCart = true">
            <span class="cart-icon">🛒</span>
            <span class="cart-badge" v-if="cartCount > 0">{{ cartCount }}</span>
          </div>

          <!-- Hamburger for Mobile -->
          <button class="menu-burger" @click="isMobileMenuOpen = true">
            ☰
          </button>
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
        <button class="close-drawer" @click="isMobileMenuOpen = false">
          ✕
        </button>
      </div>
      <div class="drawer-user-info">
        <div class="drawer-avatar">👤</div>
        <div class="drawer-details">
          <span class="drawer-name">{{ userName || "User" }}</span>
          <span class="drawer-balance"
            >Balance: ₹{{ walletBalance.toLocaleString() }}</span
          >
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
              <button class="btn-reset" @click="resetFilters">
                Reset Filters
              </button>
            </div>
          </aside>

          <!-- Listing Area -->
          <section class="listing-area">
            <div class="listing-toolbar">
              <p class="query-results">
                The query <b>"{{ searchQuery || "Directory" }}"</b> total found:
                <b>{{ filteredProducts.length }}</b> products
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
      isUserDropdownOpen: false,
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
    toggleUserDropdown() {
      this.isUserDropdownOpen = !this.isUserDropdownOpen;
      if (this.isUserDropdownOpen) {
        document.addEventListener("click", this.closeDropdownOnClickOutside);
      }
    },
    closeDropdownOnClickOutside(event) {
      if (
        !this.$el
          .querySelector(".user-dropdown-container")
          .contains(event.target)
      ) {
        this.isUserDropdownOpen = false;
        document.removeEventListener("click", this.closeDropdownOnClickOutside);
      }
    },
    openUserAction(tab) {
      this.isUserDropdownOpen = false;
      this.openUserTab(tab);
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");

/* --- Base Layout --- */
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");

.marketplace-layout {
  font-family: "Plus Jakarta Sans", sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
}

/* --- Navigation --- */
.top-nav {
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.top-nav-container {
  max-width: 1280px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.nav-logo {
  height: 40px;
  border-radius: 8px;
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1e3a8a;
  letter-spacing: -0.025em;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Wallet Display */
.wallet-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f1f5f9;
  padding: 8px 16px;
  border-radius: 99px;
  font-weight: 700;
  font-size: 0.95rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #e2e8f0;
}

.wallet-display:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
}

/* User Dropdown */
.user-dropdown-container {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.user-trigger:hover {
  border-color: #1e3a8a;
  background: #f8fafc;
}

.avatar-icon {
  font-size: 1.2rem;
}
.user-name-text {
  font-weight: 600;
  color: #334155;
  font-size: 0.95rem;
}
.dropdown-arrow {
  font-size: 0.8rem;
  color: #94a3b8;
}

.custom-dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  padding: 8px;
}

.dropdown-header {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
}

.dropdown-header strong {
  font-size: 1rem;
  color: #1e293b;
}
.dropdown-header span {
  font-size: 0.85rem;
  color: #64748b;
  margin-top: 2px;
}

.dropdown-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 6px 0;
}

.custom-dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  text-decoration: none;
  font-weight: 600;
  color: #475569;
  font-size: 0.95rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.custom-dropdown-menu a:hover {
  background: #f1f5f9;
  color: #1e3a8a;
}

.logout-btn {
  color: #ef4444 !important;
}
.logout-btn:hover {
  background: #fee2e2 !important;
}

/* Cart Pill */
.cart-pill {
  position: relative;
  background: #1e3a8a;
  color: white;
  padding: 10px 18px;
  border-radius: 99px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  transition: all 0.2s;
}

.cart-pill:hover {
  transform: scale(1.02);
  background: #1e40af;
}

.cart-badge {
  background: #ff4d4d;
  color: white;
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 10px;
}

.menu-burger {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #1e293b;
  display: none;
}

/* --- Search --- */
.search-section {
  padding: 40px 0;
}

.search-bar {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  background: white;
  padding: 6px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e2e8f0;
}

.search-bar input {
  flex: 1;
  border: none;
  padding: 12px 18px;
  font-size: 1rem;
  outline: none;
  font-weight: 500;
}

.btn-search {
  background: #1e3a8a;
  color: white;
  border: none;
  padding: 0 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-search:hover {
  background: #1e40af;
}

/* --- Main Layout --- */
.layout-body {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px 80px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

/* --- Sidebar --- */
.sidebar {
  background: white;
  padding: 24px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  align-self: start;
}

.filter-group h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 20px;
  color: #1e293b;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.category-item {
  padding: 12px 16px;
  border-radius: 12px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item:hover {
  background: #f1f5f9;
  color: #1e3a8a;
}
.category-item.active {
  background: #eff6ff;
  color: #1e3a8a;
  border: 1px solid #bfdbfe;
}

.btn-reset {
  margin-top: 24px;
  width: 100%;
  padding: 12px;
  background: #f1f5f9;
  color: #64748b;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e2e8f0;
  color: #1e293b;
}

/* --- Mobile Filter --- */
.mobile-filter-btn {
  display: none;
  width: 100%;
  padding: 14px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 700;
  margin-bottom: 20px;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

/* --- Listing --- */
.listing-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.query-results {
  color: #64748b;
  font-size: 1rem;
}
.query-results b {
  color: #1e293b;
  font-weight: 700;
}

.sorting-controls select {
  padding: 10px 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  color: #334155;
  outline: none;
  background: white;
}

/* --- Product Grid --- */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.product-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #bfdbfe;
}

.product-image {
  height: 220px;
  background: #f8fafc;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.product-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 6px;
  line-height: 1.3;
}

.product-price {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e3a8a;
  margin-bottom: 12px;
}

.product-desc {
  font-size: 0.9rem;
  color: #64748b;
  line-height: 1.5;
  height: 2.8rem;
  overflow: hidden;
  margin-bottom: 20px;
}

.btn-view {
  width: 100%;
  padding: 12px;
  background: #f8fafc;
  color: #1e3a8a;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.product-card:hover .btn-view {
  background: #1e3a8a;
  color: white;
  border-color: #1e3a8a;
}

/* --- Footer --- */
.site-footer {
  background: white;
  border-top: 1px solid #e2e8f0;
  padding: 60px 0 20px;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 40px;
}

.branding-col h3 {
  margin: 12px 0 8px;
  color: #1e3a8a;
  font-weight: 800;
}
.branding-col p {
  color: #64748b;
}

.footer-col h4 {
  font-weight: 800;
  margin-bottom: 20px;
  color: #1e293b;
}
.footer-col a {
  display: block;
  text-decoration: none;
  color: #64748b;
  margin-bottom: 10px;
  font-weight: 600;
}
.footer-col a:hover {
  color: #1e3a8a;
}

.footer-btm {
  text-align: center;
  padding-top: 40px;
  margin-top: 40px;
  border-top: 1px solid #f1f5f9;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* --- Mobile Breakpoints --- */
@media (max-width: 1024px) {
  .layout-body {
    grid-template-columns: 1fr;
  }
  .sidebar {
    display: none;
  }
  .mobile-filter-btn {
    display: flex;
  }
}

@media (max-width: 768px) {
  .top-nav-actions .user-name-text {
    display: none;
  }
  .menu-burger {
    display: block;
  }
  .top-nav-actions .wallet-display {
    padding: 6px 12px;
  }
  .footer-inner {
    grid-template-columns: 1fr;
  }
}

/* --- Mobile Drawer --- */
.mobile-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.mobile-drawer-overlay.active {
  opacity: 1;
  visibility: visible;
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 300px;
  height: 100vh;
  background: white;
  z-index: 2001;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 25px -5px rgba(0, 0, 0, 0.1);
}

.mobile-drawer.active {
  right: 0;
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header .brand-section .brand-title {
  font-size: 1.25rem;
}

.close-drawer {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
}

.drawer-user-info {
  padding: 24px 20px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 16px;
}

.drawer-avatar {
  width: 48px;
  height: 48px;
  background: #1e3a8a;
  color: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.drawer-details {
  display: flex;
  flex-direction: column;
}

.drawer-name {
  font-weight: 800;
  color: #1e293b;
  font-size: 1rem;
}

.drawer-balance {
  font-size: 0.85rem;
  color: #64748b;
  font-weight: 600;
}

.drawer-nav {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 4px;
}

.drawer-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  font-weight: 600;
  color: #475569;
  border-radius: 12px;
  transition: all 0.2s;
}

.drawer-nav a:hover {
  background: #f1f5f9;
  color: #1e3a8a;
}

.logout-link {
  color: #ef4444 !important;
  margin-top: auto;
}
</style>
