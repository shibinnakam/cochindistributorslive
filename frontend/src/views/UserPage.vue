<template>
  <div class="marketplace-layout">
    <!-- Header -->
    <header class="site-header">
      <div class="header-container">
        <div class="header-left">
          <div class="brand-section" @click="$router.push('/')">
            <h1 class="brand-title">Caterway</h1>
          </div>
          <div class="contact-info">
            <span class="phone-icon">📞</span>
            <span class="phone-number">(450) 678 099 67</span>
            <span class="dropdown-arrow">▾</span>
          </div>
        </div>

        <div class="header-right">
          <div class="user-meta">
            <div class="balance-pill">
              <span class="coin-icon">💰</span>
              <span class="balance-amount"
                >₹{{ walletBalance.toLocaleString() }}</span
              >
              <span class="dropdown-arrow">▾</span>
            </div>
            <div class="user-auth" @click="openUserAction('profile')">
              <div class="user-avatar-small">👤</div>
              <span class="auth-text">{{ userName || "SIGN IN" }}</span>
            </div>
            <button class="hamburger-btn">☰</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Hero Banner -->
    <section class="hero-banner">
      <div class="hero-content">
        <h2 class="hero-title">Restaurant directory</h2>
      </div>
      <div class="search-overlay">
        <div class="search-container-box">
          <div class="search-field location">
            <span class="icon">📍</span>
            <input type="text" placeholder="City" v-model="searchQuery" />
          </div>
          <div class="search-field date">
            <select>
              <option>Date</option>
            </select>
          </div>
          <div class="search-field time">
            <select>
              <option>Time</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content Area -->
    <main class="main-content">
      <div class="layout-container">
        <!-- Sidebar Filters -->
        <aside class="sidebar-filters">
          <div class="filter-search-box">
            <input type="text" placeholder="Search" v-model="searchQuery" />
            <span class="search-icon-small">🔍</span>
          </div>

          <div class="filter-header-row">
            <span class="filter-title"><span>📊</span> FILTER</span>
            <button class="reset-link" @click="resetFilters">
              Reset filter
            </button>
          </div>

          <div class="filter-accordions">
            <div class="accordion-item">
              <div class="accordion-header" @click="toggleSection('delivery')">
                <span>Delivery method:</span>
                <span class="toggle-icon">{{
                  sectionOpen["delivery"] ? "−" : "+"
                }}</span>
              </div>
              <div class="accordion-content" v-show="sectionOpen['delivery']">
                <label class="check-container">
                  <input
                    type="radio"
                    name="delivery"
                    value="delivery"
                    checked
                  />
                  <span class="checkmark"></span> Delivery
                </label>
                <label class="check-container">
                  <input type="radio" name="delivery" value="pickup" />
                  <span class="checkmark"></span> Pickup
                </label>
              </div>
            </div>

            <div class="accordion-item">
              <div class="accordion-header" @click="toggleSection('event')">
                <span>Event type:</span>
                <span class="toggle-icon">{{
                  sectionOpen["event"] ? "−" : "+"
                }}</span>
              </div>
              <div class="accordion-content" v-show="sectionOpen['event']">
                <label
                  class="check-container"
                  v-for="type in [
                    'Breakfast',
                    'Dinner',
                    'The conference',
                    'Buffet table',
                  ]"
                  :key="type"
                >
                  <input type="checkbox" />
                  <span class="checkmark"></span> {{ type }}
                </label>
              </div>
            </div>

            <div class="accordion-item">
              <div class="accordion-header" @click="toggleSection('cuisine')">
                <span>Type of cuisine:</span>
                <span class="toggle-icon">{{
                  sectionOpen["cuisine"] ? "−" : "+"
                }}</span>
              </div>
              <div class="accordion-content" v-show="sectionOpen['cuisine']">
                <label
                  class="check-container"
                  v-for="cat in categories"
                  :key="cat._id"
                >
                  <input
                    type="checkbox"
                    :checked="selectedCategory === cat._id"
                    @change="selectCategory(cat)"
                  />
                  <span class="checkmark"></span> {{ cat.name }}
                </label>
              </div>
            </div>
          </div>
        </aside>

        <!-- Product Listing -->
        <section class="listing-section">
          <div class="listing-header">
            <p class="results-info">
              The query <b>"{{ searchQuery || "Directory" }}"</b> total found:
              <b>{{ filteredProducts.length }}</b> products
            </p>
            <div class="listing-sort">
              <select>
                <option>Sorting</option>
              </select>
            </div>
          </div>

          <div v-if="loading" class="listing-loading">
            <div class="loader-spinner"></div>
          </div>

          <div v-else-if="filteredProducts.length === 0" class="listing-empty">
            <p>No products match your search.</p>
          </div>

          <div v-else class="product-item-grid">
            <div
              v-for="product in filteredProducts"
              :key="product._id"
              class="restaurant-card"
              @click="toggle3D(product._id)"
            >
              <div class="card-image-wrapper">
                <div class="top-badge">top</div>
                <img
                  :src="getImageUrl(product.image || product.imageFront)"
                  :alt="product.name"
                  class="main-img"
                />
                <div class="logo-overlay">
                  <img src="@/assets/logo.jpeg" alt="p-logo" />
                </div>
              </div>

              <div class="card-details">
                <h3 class="res-name">{{ product.name }}</h3>
                <div class="rating-row">
                  <div class="stars">
                    <span
                      v-for="s in 5"
                      :key="s"
                      :style="{
                        color:
                          s <= Math.round(product.averageRating || 5)
                            ? '#ff9a44'
                            : '#ccc',
                      }"
                      >★</span
                    >
                  </div>
                  <span class="count">({{ product.ratingCount || 0 }})</span>
                </div>
                <p class="tags">
                  {{ product.category ? product.category.name : "General" }} •
                  Wholesale • Distribution
                </p>
                <p class="res-desc">
                  {{ product.description }}
                </p>
                <div class="meta-info">
                  <div class="meta-item">
                    <span class="meta-icon">🛍️</span>
                    <div class="meta-text">
                      <span class="label">Min order:</span>
                      <span class="value"
                        >{{ product.quantity || 10 }} units</span
                      >
                    </div>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">💰</span>
                    <div class="meta-text">
                      <span class="label">Price:</span>
                      <span class="value">₹{{ product.discountPrice }}</span>
                    </div>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">🚚</span>
                    <div class="meta-text">
                      <span class="label">Delivery:</span>
                      <span class="value">₹20</span>
                    </div>
                  </div>
                </div>

                <div class="card-hover-action">
                  <button class="btn-more" @click.stop="toggle3D(product._id)">
                    more →
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
                    <div v-if="productReviews.length === 0" class="no-reviews">
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
                <button class="close-modal" @click.stop="toggle3D(product._id)">
                  ✕
                </button>
              </div>
            </div>
          </div>

          <div class="pagination">
            <div class="loader-dots">
              <span></span><span></span><span></span>
            </div>
          </div>
        </section>
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

/* --- New Premium Styles --- */
/* Force Desktop Layout */
.marketplace-layout {
  background-color: #f5f7f9;
  font-family: "Inter", sans-serif;
  color: #333;
  min-width: 1300px;
  overflow-x: auto;
}

/* Header */
.site-header {
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 10px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1300px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.brand-title {
  font-size: 24px;
  font-weight: 800;
  color: #333;
  margin: 0;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
}

.user-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.balance-pill {
  background: #fff;
  border: 1px solid #eee;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.user-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.user-avatar-small {
  width: 32px;
  height: 32px;
  background: #ff9a44;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.auth-text {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #333;
}

.hamburger-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #333;
  cursor: pointer;
}

/* Hero Banner */
.hero-banner {
  height: 400px;
  background: linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)),
    url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=2000");
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 60px;
}

.hero-content {
  max-width: 1300px;
  margin: 0 auto;
  width: 100%;
  padding: 0 20px;
}

.hero-title {
  color: #fff;
  font-size: 32px;
  font-weight: 800;
  margin: 0;
}

.search-overlay {
  position: absolute;
  bottom: -40px;
  left: 0;
  right: 0;
}

.search-container-box {
  max-width: 900px;
  margin: 0 auto;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 10px;
}

.search-field {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 15px;
  border-right: 1px solid #eee;
}

.search-field:last-child {
  border-right: none;
}

.search-field input,
.search-field select {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

/* Main Layout */
.main-content {
  padding-top: 100px;
  padding-bottom: 60px;
}

.layout-container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

/* Sidebar */
.sidebar-filters {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-search-box {
  position: relative;
  background: #fff;
  padding: 5px;
  border-radius: 4px;
}

.filter-search-box input {
  width: 100%;
  padding: 10px 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  outline: none;
}

.search-icon-small {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #ff9a44;
}

.filter-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.filter-title {
  font-weight: 800;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-link {
  background: none;
  border: none;
  color: #ff9a44;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.accordion-item {
  border-top: 1px solid #eee;
  padding: 15px 0;
}

.accordion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  color: #333;
}

.accordion-content {
  padding-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.check-container {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: #666;
  font-weight: 500;
  cursor: pointer;
}

/* Listing Header */
.listing-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.results-info {
  font-size: 14px;
  color: #666;
}
.results-info b {
  color: #333;
}

.listing-sort select {
  padding: 8px 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
}

/* Product Cards */
.product-item-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px;
}

.restaurant-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.restaurant-card:hover {
  transform: translateY(-5px);
}

.card-image-wrapper {
  height: 200px;
  position: relative;
}

.main-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.top-badge {
  position: absolute;
  top: 15px;
  left: 0;
  background: #ff9a44;
  color: #fff;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  border-radius: 0 4px 4px 0;
  z-index: 2;
}

.logo-overlay {
  position: absolute;
  bottom: -25px;
  left: 15px;
  width: 60px;
  height: 60px;
  background: #fff;
  border-radius: 50%;
  padding: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.logo-overlay img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-details {
  padding: 40px 20px 20px;
}

.res-name {
  font-size: 18px;
  font-weight: 800;
  margin: 0 0 8px;
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 15px;
}

.stars {
  color: #ff9a44;
  font-size: 14px;
}
.count {
  color: #999;
  font-size: 12px;
  font-weight: 600;
}

.tags {
  font-size: 12px;
  color: #ff9a44;
  font-weight: 600;
  margin-bottom: 12px;
}

.res-desc {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-info {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f1f1f1;
  padding-top: 15px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-icon {
  font-size: 14px;
}

.meta-text {
  display: flex;
  flex-direction: column;
}
.meta-text .label {
  font-size: 10px;
  color: #999;
  font-weight: 700;
}
.meta-text .value {
  font-size: 11px;
  color: #333;
  font-weight: 800;
}

/* Card Hover */
.card-hover-action {
  position: absolute;
  bottom: 0px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.restaurant-card:hover .card-hover-action {
  bottom: 15px;
  opacity: 1;
}

.btn-more {
  background: #ff9a44;
  color: #fff;
  border: none;
  padding: 8px 30px;
  border-radius: 20px 4px 20px 20px;
  font-weight: 800;
  font-size: 12px;
  cursor: pointer;
  box-shadow: 0 5px 15px rgba(255, 154, 68, 0.4);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 50px;
}

.loader-dots {
  display: flex;
  gap: 10px;
}

.loader-dots span {
  width: 8px;
  height: 8px;
  background: #ff9a44;
  border-radius: 50%;
  opacity: 0.3;
}

.loader-dots span:first-child {
  opacity: 1;
}
</style>
