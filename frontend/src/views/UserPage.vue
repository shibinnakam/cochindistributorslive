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
            <span class="wallet-balance">💰 ₹{{ walletBalance.toLocaleString() }}</span>
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
            <span class="icon">🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              v-model="searchQuery"
            />
            <button class="img-search-btn" title="Search by image" @click="triggerImageUpload">
              📷
            </button>
          </div>
          <div class="ribbon-item select-box">
            <span class="icon">📁</span>
            <select v-model="selectedCategory">
              <option :value="null">All Categories</option>
              <option v-for="cat in categories" :key="cat._id" :value="cat._id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="ribbon-item select-box">
            <span class="icon">📍</span>
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
                  <div class="product-labels">
                    <span
                      >{{
                        product.category ? product.category.name : "Wholesale"
                      }}
                      • Bulk</span
                    >
                  </div>
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
                  
                  <p class="product-teaser">
                    {{
                      product.description ||
                      "Premium distribution quality product for businesses."
                    }}
                  </p>

                  <div class="product-stats">
                    <div class="stat">
                      <span class="label">Min order price</span>
                      <span class="value">₹{{ product.discountPrice }}</span>
                    </div>
                  </div>

                  <div class="card-footer">
                    <button
                      class="btn-view-more"
                      @click.stop="toggle3D(product._id)"
                    >
                      View Details <span>→</span>
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
/* --- Base Layout --- */
.marketplace-layout {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background-color: #f8fafc;
  min-height: 100vh;
  color: #1e293b;
  line-height: 1.5;
}

/* --- Top Navigation --- */
.top-nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.8);
  padding: 12px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  transition: all 0.3s ease;
}

.top-nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.brand-section:hover {
  opacity: 0.8;
}

.nav-logo {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.brand-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #0f172a;
  letter-spacing: -0.03em;
}

.phone-link {
  color: #f97316;
  font-weight: 600;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 6px;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-extra-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.wallet-balance {
  font-weight: 700;
  font-size: 0.9rem;
  color: #0f172a;
  background: #fff7ed;
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #ffedd5;
}

.user-action .btn-signin {
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s;
}

.user-action .btn-signin:hover {
  background: #f1f5f9;
}

.nav-dropdown {
  display: none;
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  overflow: hidden;
  z-index: 100;
}

.dropdown-trigger:hover .nav-dropdown {
  display: block;
}

.nav-dropdown a {
  display: block;
  padding: 12px 16px;
  color: #475569;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.nav-dropdown a:hover {
  background: #f8fafc;
  color: #f97316;
  padding-left: 20px;
}

.cart-btn {
  position: relative;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  border-radius: 50%;
  transition: transform 0.2s, background 0.2s;
}

.cart-btn:hover {
  background: #e2e8f0;
  transform: scale(1.05);
}

.cart-btn .badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #f97316;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 2px solid white;
}

.hamburger {
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  font-size: 1.25rem;
  cursor: pointer;
  color: #475569;
  display: none;
}

/* --- Hero Section --- */
.hero-section {
  background: linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.4)),
    url("https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop")
    center/cover no-repeat;
  height: 280px;
  display: flex;
  align-items: center;
  padding-bottom: 20px;
}

.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 24px;
}

.hero-container h1 {
  color: #ffffff;
  font-size: 3rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

/* --- Main Content Wrapper --- */
.main-content-wrapper {
  margin-top: -60px;
  padding-bottom: 80px;
  position: relative;
  z-index: 10;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 24px;
}

/* --- Filter Ribbon --- */
.search-filter-ribbon {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
  display: flex;
  padding: 16px;
  gap: 16px;
  margin-bottom: 40px;
  border: 1px solid #f1f5f9;
}

.ribbon-item {
  flex: 1;
  display: flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
  transition: all 0.2s;
}

.ribbon-item:focus-within {
  background: #ffffff;
  border-color: #f97316;
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
}

.ribbon-item .icon {
  margin-right: 12px;
  font-size: 1.1rem;
}

.ribbon-item input,
.ribbon-item select {
  background: transparent;
  border: none;
  outline: none;
  width: 100%;
  font-size: 0.95rem;
  font-weight: 500;
  color: #1e293b;
}

.ribbon-item select {
  cursor: pointer;
}

.img-search-btn {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.img-search-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* --- Layout Body --- */
.layout-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 40px;
}

/* --- Sidebar --- */
.filter-sidebar {
  background: white;
  border: 1px solid #f1f5f9;
  border-radius: 16px;
  padding: 24px;
  align-self: start;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1rem;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-reset {
  background: none;
  border: none;
  color: #f97316;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.btn-reset:hover {
  text-decoration: underline;
}

.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  margin-bottom: 16px;
  padding: 4px 0;
}

.filter-section h4:hover {
  color: #f97316;
}

.filter-section h4 span {
  color: #94a3b8;
  font-size: 1.1rem;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.section-content label {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: color 0.2s;
}

.section-content label:hover {
  color: #0f172a;
}

.section-content input[type="checkbox"] {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  accent-color: #f97316;
  cursor: pointer;
}

/* --- Listings Area --- */
.listing-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.listing-toolbar p {
  font-size: 0.95rem;
  color: #64748b;
  margin: 0;
}

.listing-toolbar b {
  color: #0f172a;
}

.sorting-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #64748b;
}

.sorting-controls select {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 12px;
  border-radius: 8px;
  outline: none;
  font-weight: 600;
  color: #0f172a;
}

/* --- Product Grid & Cards --- */
.product-marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 32px;
}

.marketplace-product-card {
  background: white;
  border-radius: 20px;
  border: 1px solid #f1f5f9;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  display: flex;
  flex-direction: column;
}

.marketplace-product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03);
}

.card-thumb {
  height: 220px;
  position: relative;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.card-thumb img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  transition: transform 0.5s ease;
}

.marketplace-product-card:hover .card-thumb img {
  transform: scale(1.1);
}

.top-tag {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #f97316;
  color: white;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 30px;
  letter-spacing: 0.05em;
  z-index: 10;
}

.brand-spot {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  background: white;
  border: 1.5px solid #f1f5f9;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.card-body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 10px;
  line-height: 1.3;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  color: #e2e8f0;
  font-size: 0.9rem;
}

.star.filled {
  color: #fbbf24;
}

.product-rating .count {
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
}

.product-labels {
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.product-teaser {
  font-size: 0.9rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 24px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-stats {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #f1f5f9;
  margin-bottom: 24px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
}

.stat .value {
  font-size: 1.25rem;
  font-weight: 800;
  color: #0f172a;
}

.card-footer {
  display: flex;
  gap: 12px;
}

.btn-view-more {
  flex: 1;
  background: #0f172a;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-view-more:hover {
  background: #1e293b;
  gap: 12px;
}

.btn-buy {
  background: #f1f5f9;
  color: #0f172a;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-buy:hover {
  background: #e2e8f0;
}

/* --- 3D Modal --- */
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
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-content-3d {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100%;
}

.visualizer-section {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
}

.details-section {
  padding: 32px;
  overflow-y: auto;
}

.details-section h3 {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 24px;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mini-review-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #f1f5f9;
  margin-bottom: 16px;
}

.rev-user {
  font-weight: 700;
  font-size: 0.9rem;
  color: #1e293b;
}

.rev-comment {
  font-size: 0.95rem;
  color: #475569;
  line-height: 1.5;
  margin: 12px 0;
}

.close-modal {
  position: absolute;
  top: 16px;
  right: 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.2s;
}

.close-modal:hover {
  background: #f1f5f9;
  transform: rotate(90deg);
}

/* --- Mobile Nav & Drawer --- */
@media (max-width: 1024px) {
  .hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .layout-body {
    grid-template-columns: 1fr;
  }

  .filter-sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    bottom: 0;
    width: 320px;
    z-index: 2500;
    transition: left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 0 20px 20px 0;
  }

  .filter-sidebar.mobile-open {
    left: 0;
  }

  .mobile-filter-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    width: 100%;
    padding: 16px;
    background: #0f172a;
    color: white;
    border: none;
    border-radius: 14px;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 24px;
    cursor: pointer;
    box-shadow: 0 10px 15px -3px rgba(15, 23, 42, 0.2);
  }

  .btn-close-filter {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 300px;
  height: 100vh;
  background: white;
  z-index: 2200;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0,0,0,0.1);
}

.mobile-drawer.active {
  right: 0;
}

.drawer-header {
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-user-info {
  padding: 32px 24px;
  background: #f8fafc;
  display: flex;
  gap: 16px;
  align-items: center;
}

.drawer-avatar {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
}

.drawer-nav {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.drawer-nav a {
  text-decoration: none;
  color: #475569;
  font-weight: 600;
  padding: 14px 20px;
  border-radius: 12px;
  transition: all 0.2s;
}

.drawer-nav a:hover {
  background: #f1f5f9;
  color: #0f172a;
  padding-left: 28px;
}

/* --- Responsive Helpers --- */
@media (max-width: 768px) {
  .hero-section {
    height: 220px;
  }
  
  .hero-container h1 {
    font-size: 2.25rem;
  }

  .main-content-wrapper {
    margin-top: -40px;
  }

  .search-filter-ribbon {
    flex-direction: column;
    padding: 12px;
    gap: 12px;
  }

  .ribbon-item {
    width: 100%;
  }

  .product-marketplace-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .top-nav-center {
    display: none;
  }
}
</style>
