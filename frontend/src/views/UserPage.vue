<template>
  <div class="marketplace-layout">
    <!-- Slim Navbar -->
    <nav class="top-nav">
      <div class="top-nav-container">
        <div class="brand-section" @click="$router.push('/')">
          <img src="@/assets/logo.jpeg" alt="Logo" class="nav-logo" />
          <span class="brand-title">Caterway</span>
        </div>

        <div class="top-nav-center desktop-only">
          <div class="phone-dropdown">
            <span class="phone-link">📞 (450) 678 099 67 ▾</span>
          </div>
        </div>

        <div class="top-nav-actions">
          <div class="nav-extra-info">
            <div class="wallet-badge-minimal">
              <span class="coin-icon">💰</span>
              <span class="balance">₹{{ walletBalance.toLocaleString() }}</span>
              <span class="arrow">▾</span>
            </div>
          </div>
          <div class="user-action dropdown-trigger desktop-only">
            <div class="btn-signin-nav">
              <div class="user-avatar-small">👤</div>
              <span>{{ userName || "SIGN IN" }}</span>
            </div>
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

    <!-- Hero Section -->
    <header class="hero-section">
      <div class="hero-container">
        <h1 class="hero-title">Restaurant directory</h1>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="main-content-wrapper">
      <div class="content-container">
        <!-- Multi-Input Search Bar -->
        <div class="master-search-bar">
          <div class="search-input-group city-input">
            <span class="icon">📍</span>
            <input
              type="text"
              placeholder="City"
              v-model="searchQuery"
            />
            <button class="img-search-btn" title="Search by image" @click="triggerImageUpload">
              🔍
            </button>
          </div>
          <div class="search-input-group date-input">
            <span class="icon">📅</span>
            <select>
              <option>Date</option>
            </select>
          </div>
          <div class="search-input-group time-input">
            <span class="icon">🕒</span>
            <select>
              <option>Time</option>
            </select>
          </div>
          <button class="master-search-btn">
            🔍
          </button>
          
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
              <button class="btn-reset-text" @click="resetFilters">Reset filter</button>
              <button class="btn-close-filter-mobile" @click="isFilterOpen = false">
                ✕
              </button>
            </div>

            <div class="filter-section">
              <h4 @click="toggleSection('delivery')">
                Delivery method:
                <span class="toggle-icon">{{ sectionOpen.delivery ? "−" : "+" }}</span>
              </h4>
              <div class="section-content" v-show="sectionOpen.delivery">
                <label class="custom-radio">
                  <input type="radio" name="delivery" value="delivery" checked />
                  <span class="radio-mark"></span>
                  Delivery
                </label>
                <label class="custom-radio">
                  <input type="radio" name="delivery" value="pickup" />
                  <span class="radio-mark"></span>
                  Pickup
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h4 @click="toggleSection('categories')">
                Categories: 
                <span class="toggle-icon">{{ sectionOpen.categories ? "−" : "+" }}</span>
              </h4>
              <div class="section-content" v-show="sectionOpen.categories">
                <label v-for="cat in categories" :key="cat._id" class="custom-checkbox">
                  <input
                    type="checkbox"
                    :checked="selectedCategory === cat._id"
                    @change="selectCategory(cat)"
                  />
                  <span class="checkbox-mark"></span>
                  {{ cat.name }}
                </label>
              </div>
            </div>

            <div class="filter-section">
              <h4>Additional criterion <span class="toggle-icon">+</span></h4>
            </div>
            
            <div class="filter-section">
              <h4>Additional criterion <span class="toggle-icon">+</span></h4>
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
                        :class="{ filled: star <= Math.round(product.averageRating || 0) }"
                        class="star"
                      >★</span>
                    </div>
                    <span class="count">({{ product.ratingCount || 0 }})</span>
                  </div>
                  
                  <div class="product-labels">
                    <span>{{ product.category ? product.category.name : "Wholesale" }} • Bulk • Direct</span>
                  </div>

                  <p class="product-teaser">
                    {{ product.description || "Premium distribution quality product for businesses." }}
                  </p>

                  <div class="product-stats-row">
                    <div class="stat-item">
                      <span class="stat-icon">💰</span>
                      <div class="stat-text">
                        <span class="label">Min order</span>
                        <span class="value">₹{{ product.discountPrice }}</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <span class="stat-icon">🕒</span>
                      <div class="stat-text">
                        <span class="label">Min.notice</span>
                        <span class="value">24 hr</span>
                      </div>
                    </div>
                    <div class="stat-item">
                      <span class="stat-icon">🚚</span>
                      <div class="stat-text">
                        <span class="label">Delivery</span>
                        <span class="value">₹20</span>
                      </div>
                    </div>
                  </div>

                  <div class="card-bottom-action">
                    <button class="btn-more-orange" @click.stop="toggle3D(product._id)">
                      more <span>→</span>
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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

/* --- Base Layout --- */
.marketplace-layout {
  font-family: 'Inter', sans-serif;
  background-color: #f4f7f6;
  min-height: 100vh;
  color: #334155;
  line-height: 1.5;
}

/* --- Navigation --- */
.top-nav {
  background: #ffffff;
  padding: 12px 0;
  border-bottom: 1px solid #ebebeb;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.02);
}

.top-nav-container {
  max-width: 1320px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.nav-logo {
  height: 40px;
  width: auto;
}

.brand-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -1px;
}

.phone-link {
  color: #f97316;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}

.top-nav-actions {
  display: flex;
  align-items: center;
  gap: 25px;
}

.wallet-badge-minimal {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fdfdfd;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 1rem;
  border: 1px solid #e2e8f0;
  color: #1e293b;
}

.btn-signin-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f97316;
  color: white;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-signin-nav:hover {
  background: #ea580c;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.2);
}

.cart-btn {
  position: relative;
  cursor: pointer;
  font-size: 1.4rem;
  color: #334155;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-btn .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #f97316;
  color: white;
  font-size: 0.75rem;
  font-weight: 800;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid white;
}

.hamburger-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #1e293b;
  cursor: pointer;
  padding: 5px;
}

/* --- Hero --- */
.hero-section {
  background: linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.2)), url('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=2674&auto=format&fit=crop') center/cover;
  height: 240px;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1320px;
  margin: 0 auto;
  width: 100%;
  padding: 0 40px;
}

.hero-title {
  color: white;
  font-size: 2.4rem;
  font-weight: 800;
  margin: 0;
  text-shadow: 0 4px 15px rgba(0,0,0,0.2);
  transform: translateY(-10px);
}

/* --- Master Search Bar --- */
.master-search-bar {
  background: white;
  max-width: 1240px;
  margin: -45px auto 40px;
  padding: 12px;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  display: flex;
  gap: 12px;
  align-items: center;
  position: relative;
  z-index: 100;
}

.search-input-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #f0f0f0;
  padding: 14px 20px;
  border-radius: 8px;
  background: #ffffff;
}

.search-input-group .icon {
  color: #f97316;
  font-size: 1.1rem;
}

.search-input-group input, 
.search-input-group select {
  border: none;
  background: transparent;
  width: 100%;
  outline: none;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
}

.master-search-btn {
  background: #f97316;
  color: white;
  border: none;
  width: 58px;
  height: 58px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: all 0.2s;
}

.master-search-btn:hover {
  background: #ea580c;
}

.img-search-btn {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.img-search-btn:hover {
  opacity: 1;
}

/* --- Layout Body --- */
.layout-body {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 50px;
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
}

/* --- Sidebar --- */
.filter-sidebar {
  background: transparent;
  align-self: start;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.filter-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
  font-size: 0.9rem;
  letter-spacing: 1.5px;
  color: #1e293b;
}

.btn-reset-text {
  background: none;
  border: none;
  color: #f97316;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.filter-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.02);
}

.filter-section h4 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  color: #1e293b;
}

.toggle-icon {
  color: #e2e8f0;
  font-size: 1.2rem;
  transition: transform 0.3s;
}

.section-content {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Custom Controls */
.custom-radio, .custom-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 600;
  color: #475569;
}

.custom-radio input, .custom-checkbox input {
  display: none;
}

.radio-mark, .checkbox-mark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  background: white;
}

.checkbox-mark { border-radius: 4px; }

.custom-radio input:checked + .radio-mark,
.custom-checkbox input:checked + .checkbox-mark {
  border-color: #f97316;
  background: #f97316;
}

.custom-radio input:checked + .radio-mark::after {
  content: '';
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.custom-checkbox input:checked + .checkbox-mark::after {
  content: '✓';
  color: white;
  font-size: 12px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* --- Listing Area --- */
.query-results {
  font-size: 1rem;
  color: #64748b;
}

.query-results b { color: #1e293b; }

.sorting-controls select {
  background: white;
  border: 1px solid #e2e8f0;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  color: #1e293b;
  outline: none;
}

/* --- Product Cards --- */
.product-marketplace-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 40px;
}

.marketplace-product-card {
  background: white;
  border-radius: 20px;
  overflow: visible;
  box-shadow: 0 20px 40px rgba(0,0,0,0.04);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.marketplace-product-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 40px 80px rgba(0,0,0,0.08);
}

.card-thumb {
  height: 280px;
  background: #f8fafc;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px 20px 0 0;
  overflow: hidden;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.marketplace-product-card:hover .card-thumb img {
  transform: scale(1.1);
}

.top-tag {
  position: absolute;
  top: 20px;
  left: 0;
  background: #f97316;
  color: white;
  padding: 4px 15px;
  border-radius: 0 4px 4px 0;
  font-size: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  z-index: 10;
  box-shadow: 4px 4px 10px rgba(0,0,0,0.1);
}

.brand-spot {
  position: absolute;
  bottom: -30px;
  left: 20px;
  width: 90px;
  height: 90px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 15px;
  z-index: 5;
  border: 4px solid white;
}

.brand-spot img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-body {
  padding: 45px 30px 30px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-name {
  font-size: 1.6rem;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 8px;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.stars { color: #f97316; font-size: 1.1rem; gap: 2px; }
.product-rating .count { color: #94a3b8; font-size: 0.95rem; font-weight: 600; }

.product-labels {
  font-size: 0.9rem;
  color: #64748b;
  margin-bottom: 15px;
  font-weight: 500;
}

.product-teaser {
  font-size: 1rem;
  color: #475569;
  line-height: 1.6;
  margin-bottom: 25px;
  height: 3.2em;
  overflow: hidden;
}

.product-stats-row {
  display: flex;
  justify-content: space-between;
  border-top: 1px solid #f1f5f9;
  padding-top: 25px;
  margin-bottom: 30px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 1.3rem;
  color: #f97316;
}

.stat-text {
  display: flex;
  flex-direction: column;
}

.stat-text .label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; }
.stat-text .value { font-size: 1rem; font-weight: 800; color: #1e293b; }

.card-bottom-action {
  display: flex;
  justify-content: center;
}

.btn-more-orange {
  width: 100%;
  max-width: 200px;
  background: #f97316;
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 40px;
  font-weight: 800;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.btn-more-orange:hover {
  background: #ea580c;
  transform: scale(1.05);
  box-shadow: 0 15px 30px rgba(249, 115, 22, 0.3);
}

/* --- Pagination --- */
.pagination-dots {
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 60px;
}

.dot {
  width: 12px;
  height: 12px;
  background: #e2e8f0;
  border-radius: 50%;
  cursor: pointer;
}

.dot.active {
  background: #f97316;
  width: 30px;
  border-radius: 10px;
}

/* --- Mobile --- */
@media (max-width: 1200px) {
  .product-marketplace-grid { grid-template-columns: 1fr; }
}

@media (max-width: 1024px) {
  .top-nav-container { padding: 0 20px; }
  .layout-body { grid-template-columns: 1fr; padding: 0 20px; }
  .master-search-bar { flex-direction: column; margin: -60px 20px 40px; padding: 15px; }
  .search-input-group { width: 100%; }
  .master-search-btn { width: 100%; height: 50px; }
  
  .filter-sidebar {
    position: fixed;
    left: -100%;
    top: 0;
    width: 320px;
    height: 100vh;
    background: white;
    z-index: 2000;
    padding: 30px;
    transition: 0.4s;
    overflow-y: auto;
    box-shadow: 20px 0 50px rgba(0,0,0,0.1);
  }
  .filter-sidebar.mobile-open { left: 0; }
  
  .mobile-filter-btn {
    display: flex;
    width: 100%;
    padding: 16px;
    background: #1e293b;
    color: white;
    border: none;
    border-radius: 12px;
    margin-bottom: 30px;
    font-weight: 800;
    justify-content: center;
    gap: 10px;
  }

  .footer-inner {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 320px;
  height: 100vh;
  background: white;
  z-index: 3000;
  transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: -20px 0 50px rgba(0,0,0,0.1);
}

.mobile-drawer.active { right: 0; }

.drawer-header {
  padding: 30px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-user-info {
  padding: 40px 30px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  gap: 20px;
}

.drawer-avatar {
  width: 60px;
  height: 60px;
  background: #f1f5f9;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  border: 1px solid #e2e8f0;
}

.drawer-nav {
  padding: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.drawer-nav a {
  padding: 15px 25px;
  border-radius: 12px;
  font-weight: 700;
  color: #475569;
  text-decoration: none;
  transition: 0.2s;
}

.drawer-nav a:hover {
  background: #f1f5f9;
  color: #f97316;
}

.btn-buy-modal {
  width: 100%;
  margin-top: 20px;
  background: #f97316;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 12px;
  font-weight: 800;
  cursor: pointer;
}
/* --- User Dropdown --- */
.user-action {
  position: relative;
}

.nav-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  background: white;
  min-width: 200px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  padding: 10px;
  display: none;
  flex-direction: column;
  border: 1px solid #f1f5f9;
  z-index: 1000;
}

.user-action:hover .nav-dropdown {
  display: flex;
}

.nav-dropdown a {
  padding: 12px 15px;
  color: #475569;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  border-radius: 8px;
  transition: 0.2s;
}

.nav-dropdown a:hover {
  background: #f8fafc;
  color: #f97316;
}

/* --- Footer --- */
.site-footer {
  background: #1e293b;
  color: white;
  padding: 80px 0 40px;
  margin-top: 100px;
}

.footer-inner {
  max-width: 1320px;
  margin: 0 auto;
  padding: 0 40px;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 60px;
}

.footer-col h3, .footer-col h4 {
  color: white;
  margin-bottom: 25px;
  font-weight: 800;
}

.footer-col p, .footer-col a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.95rem;
  display: block;
  margin-bottom: 12px;
  transition: 0.2s;
}

.footer-col a:hover {
  color: #f97316;
}

.footer-logo {
  height: 50px;
  width: auto;
  margin-bottom: 20px;
  filter: brightness(0) invert(1);
}

.footer-btm {
  max-width: 1320px;
  margin: 80px auto 0;
  padding: 40px 40px 0;
  border-top: 1px solid rgba(255,255,255,0.1);
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
}
</style>
