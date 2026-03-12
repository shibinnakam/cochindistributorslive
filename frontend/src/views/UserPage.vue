<template>
  <div class="pos-wrapper">
    <!-- Left Sidebar -->
    <aside class="pos-sidebar">
      <div class="sidebar-brand" @click="$router.push('/')">
        <div class="brand-logo">C</div>
        <span class="brand-name">Cochin Distributors</span>
      </div>

      <div class="user-profile-small">
        <div class="user-avatar">
          <img
            src="https://ui-avatars.com/api/?name=User&background=ff9a44&color=fff"
            alt="User"
          />
        </div>
        <div class="user-info">
          <h4 class="user-name">{{ userName }}</h4>
          <p class="user-role">Product Designer</p>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <label>Main Menu</label>
          <a href="#" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            Dashboard
          </a>
          <a href="#" class="nav-item active">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
            Pos
          </a>
          <a href="#" class="nav-item" @click.prevent="showWallet = true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
            My Wallet
          </a>
          <a href="#" class="nav-item" @click.prevent="showOrders = true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
            My Orders
          </a>
          <a href="#" class="nav-item" @click.prevent="showScratchCardsList = true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"></path><line x1="13" y1="5" x2="13" y2="19"></line></svg>
            Scratchcards
          </a>
        </div>

        <div class="nav-section">
          <label>Offering</label>
          <a href="#" class="nav-item" @click.prevent="showInvoices = true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            Invoice
          </a>
        </div>

        <div class="nav-section">
          <label>Back Office</label>
          <a href="#" class="nav-item" @click.prevent="showProfile = true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            User
          </a>
          <a href="#" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Reports
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-logout" @click="logout">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Log Out
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="pos-main">
      <!-- Top Navigation -->
      <header class="pos-top-nav">
        <div class="nav-search">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            placeholder="Search (Ctrl+/)"
            v-model="searchQuery"
          />
        </div>
        <div class="nav-actions">
          <div class="wallet-pill" @click="showWallet = true">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
            <span class="wallet-amount">₹{{ walletBalance }}</span>
          </div>
        </div>
      </header>

      <div class="pos-content">
        <div class="content-header">
          <div class="title-area">
            <h1>Product Catalog</h1>
            <nav class="breadcrumb">Dashboard • Point of Sale</nav>
          </div>
        </div>

        <!-- Product Filter Bar -->
        <div class="product-filter-bar">
          <div class="filter-input-group">
            <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search in products"
              v-model="searchQuery"
            />
            <button class="btn-visual-search" @click="$refs.visualSearchInput.click()" title="Search by Image">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="nav-icon"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            </button>
            <input 
              type="file" 
              ref="visualSearchInput" 
              style="display: none" 
              accept="image/*" 
              capture="environment"
              @change="handleVisualSearch"
            />
          </div>
          <select v-model="selectedCategory" class="filter-select">
            <option :value="null">All Category</option>
            <option v-for="cat in categories" :key="cat._id" :value="cat._id">
              {{ cat.name }}
            </option>
          </select>
          <select class="filter-select">
            <option>Select Brand</option>
          </select>
        </div>

        <!-- Category Tabs -->
        <div class="category-tabs">
          <button
            class="tab-item"
            :class="{ active: selectedCategory === null }"
            @click="selectedCategory = null"
          >
            Show All
          </button>
          <button
            v-for="cat in categories"
            :key="cat._id"
            class="tab-item"
            :class="{ active: selectedCategory === cat._id }"
            @click="selectedCategory = cat._id"
          >
            {{ cat.name }}
          </button>
        </div>

        <!-- Product Grid -->
        <div class="pos-product-grid">
          <div v-if="loading || visualSearchLoading" class="grid-loading">
             <div class="loading-spinner"></div>
             <span>{{ visualSearchLoading ? 'AI identifying products...' : 'Loading...' }}</span>
          </div>
          <div v-if="isAiSearch" class="ai-search-banner">
            <span>Showing matched products from AI visual search</span>
            <button @click="clearAiSearch" class="btn-clear-ai">Clear Search</button>
          </div>
          <div
            v-for="product in filteredProducts"
            :key="product._id"
            class="pos-product-card"
          >
            <div class="product-img" @click="addToCart(product)">
              <img
                :src="getImageUrl(product.image || product.imageFront)"
                :alt="product.name"
              />
            </div>
            <div class="product-details">
              <h3 class="name" @click="addToCart(product)">
                {{ product.name }}
              </h3>
              <p class="description" @click="addToCart(product)">
                {{ product.description }}
              </p>
              <div class="price-row">
                <p class="price">₹{{ product.discountPrice }}</p>
                <button class="btn-add-cart" @click.stop="addToCart(product)">
                  Add to Cart
                </button>
              </div>
            </div>
            <div class="card-extra-actions">
              <button class="btn-3d-mini" @click.stop="toggle3D(product)">
                <svg class="nav-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                3D
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Right Order Panel -->
    <aside class="pos-order-panel" v-if="cartItems.length > 0">
      <div class="panel-header">
        <div class="search-existing">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" placeholder="Search in Existing" />
        </div>
      </div>

      <div class="dining-selectors">
        <select class="order-select">
          <option>Select Dining</option>
        </select>
        <select class="order-select">
          <option>Select Table</option>
        </select>
      </div>

      <div class="current-order-section">
        <div class="order-id-row">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          <strong>Order #20</strong>
        </div>

        <div class="order-items-list">
          <div v-if="cartItems.length === 0" class="empty-order">
            No items in order
          </div>
          <div v-for="item in cartItems" :key="item._id" class="order-item">
            <button
              class="btn-remove"
              @click="removeFromCart(item.product._id)"
              title="Remove from cart"
            >
              <svg class="trash-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
            <div class="item-info">
              <p class="name">{{ item.product.name }}</p>
              <p class="price">
                ₹{{ item.product.discountPrice }} × {{ item.quantity }} =
                <strong
                  >₹{{ item.product.discountPrice * item.quantity }}</strong
                >
              </p>
            </div>
            <div class="item-actions">
              <div class="qty-controls">
                <button @click="updateQty(item.product._id, item.quantity - 1)">
                  -
                </button>
                <span>{{ item.quantity }}</span>
                <button @click="updateQty(item.product._id, item.quantity + 1)">
                  +
                </button>
              </div>
              <button class="btn-add-notes">Add Notes</button>
            </div>
          </div>
        </div>
      </div>

      <div class="order-summary" v-if="cartItems.length > 0">
        <!-- Payment Method Selection -->
        <div class="pos-payment-selection">
          <label
            class="pay-method"
            :class="{ selected: selectedPaymentMethod === 'razorpay' }"
          >
            <input
              type="radio"
              value="razorpay"
              v-model="selectedPaymentMethod"
            />
            <span>Razorpay</span>
          </label>
          <label
            class="pay-method"
            :class="{
              selected: selectedPaymentMethod === 'wallet',
              disabled: walletBalance < cartTotal - productDiscount,
            }"
          >
            <input
              type="radio"
              value="wallet"
              v-model="selectedPaymentMethod"
              :disabled="walletBalance < cartTotal - productDiscount"
            />
            <span>Wallet</span>
          </label>
        </div>

        <div class="summary-row">
          <span>Sub total :</span>
          <strong>₹{{ cartTotal }}</strong>
        </div>
        <div class="summary-row">
          <span>Product Discount :</span>
          <strong>₹{{ productDiscount }}</strong>
        </div>
        <div class="total-row">
          <span>Total :</span>
          <strong>₹{{ cartTotal - productDiscount }}</strong>
        </div>
      </div>

      <div class="panel-actions">
        <button
          class="btn-orange-wide payment-btn"
          @click="handlePayment"
          :disabled="!selectedPaymentMethod || cartItems.length === 0"
        >
          {{ processingPayment ? "Processing..." : "Place Order & Pay" }}
        </button>
        <div class="dual-actions">
          <button class="btn-navy-full">KOT & Print</button>
          <button class="btn-white-half">Draft</button>
        </div>
      </div>
    </aside>

    <!-- Modal Elements (Hidden usually) -->
    <ProfilePage v-if="showProfile" @close="showProfile = false" />
    <WalletPage v-if="showWallet" @close="showWallet = false" />
    <OrdersPage v-if="showOrders" @close="showOrders = false" />
    <ScratchCardsPage
      v-if="showScratchCardsList"
      @close="showScratchCardsList = false"
      @reveal-card="handleRevealFromList"
    />
    <ScratchCard
      v-if="showScratchCard"
      :orderId="scratchCardOrderId"
      :initialRevealed="scratchCardInitialRevealed"
      :initialAmount="scratchCardInitialAmount"
      @close="closeScratchCard"
      @wallet-updated="updateWalletBalance"
    />
    <InvoicesPage
      v-if="showInvoices"
      @close="showInvoices = false"
    />

    <!-- 3D Visualizer Modal -->
    <div
      v-if="show3DModal"
      class="view3d-overlay"
      @click.self="show3DModal = false"
    >
      <div class="view3d-container">
        <button class="close-3d" @click="show3DModal = false">✕</button>
        <div class="view3d-header">
          <h3>{{ selectedProduct3D?.name }} - 3D View</h3>
        </div>
        <div class="view3d-body">
          <!-- Real 3D Model -->
          <model-viewer
            v-if="selectedProduct3D && selectedProduct3D.model3D"
            :src="getModelUrl(selectedProduct3D.model3D)"
            :alt="selectedProduct3D.name"
            auto-rotate
            camera-controls
            ar
            shadow-intensity="1"
            style="width: 100%; height: 300px"
          ></model-viewer>

          <!-- Simulated 3D Box -->
          <ThreeDBox
            v-else-if="selectedProduct3D"
            :image="getImageUrl(selectedProduct3D.image)"
            :image-front="getImageUrl(selectedProduct3D.imageFront)"
            :image-side="getImageUrl(selectedProduct3D.imageSide)"
            :image-back="getImageUrl(selectedProduct3D.imageBack)"
            :image-top="getImageUrl(selectedProduct3D.imageTop)"
            :image-bottom="getImageUrl(selectedProduct3D.imageBottom)"
            :shape="selectedProduct3D.shape"
          />
        </div>
        <div class="view3d-footer">
          <button class="btn-orange-new" @click="handleAddToCartFrom3D">
            Add to Order
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";
import socket from "@/socket.js";
import ScratchCard from "@/components/ScratchCard.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import WalletPage from "@/views/WalletPage.vue";
import OrdersPage from "@/views/OrdersPage.vue";
import ScratchCardsPage from "@/views/ScratchCardsPage.vue";
import InvoicesPage from "@/views/InvoicesPage.vue";
import ThreeDBox from "@/components/ThreeDBox.vue";

export default {
  name: "UserPage",
  components: {
    ScratchCard,
    ProfilePage,
    WalletPage,
    OrdersPage,
    ScratchCardsPage,
    InvoicesPage,
    ThreeDBox,
  },
  data() {
    return {
      products: [],
      categories: [],
      cartItems: [],
      loading: false,
      searchQuery: "",
      userName: "User",
      showProfile: false,
      showWallet: false,
      showOrders: false,
      showScratchCardsList: false,
      showInvoices: false,
      selectedCategory: null,
      showScratchCard: false,
      scratchCardOrderId: null,
      scratchCardInitialRevealed: false,
      scratchCardInitialAmount: 0,
      walletBalance: 0,
      show3DModal: false,
      selectedProduct3D: null,
      selectedPaymentMethod: null,
      processingPayment: false,
      userProfile: null,
      visualSearchLoading: false,
      isAiSearch: false,
    };
  },
  computed: {
    filteredProducts() {
      let result = this.products;
      if (this.selectedCategory) {
        result = result.filter(
          (p) => p.category && p.category._id === this.selectedCategory
        );
      }
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
    cartTotal() {
      return this.cartItems.reduce((acc, item) => {
        return acc + item.product.discountPrice * item.quantity;
      }, 0);
    },
    productDiscount() {
      // Mock discount or calculate based on business logic
      return Math.round(this.cartTotal * 0.1); // 10% discount example
    },
  },
  mounted() {
    this.fetchProducts();
    this.fetchCategories();
    this.fetchCart();
    this.fetchWalletBalance();
    this.fetchUserProfile();
    this.loadRazorpay();

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.userName =
          user.name || (user.email ? user.email.split("@")[0] : "User");
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    socket.on("productAdded", (data) => this.products.unshift(data.product));
    socket.on("productUpdated", (data) => {
      const index = this.products.findIndex((p) => p._id === data.product._id);
      if (index !== -1) this.$set(this.products, index, data.product);
    });
    socket.on("productDeleted", (data) => {
      this.products = this.products.filter((p) => p._id !== data.productId);
    });
    socket.on("cartUpdated", (data) => {
      this.cartItems = data.cart;
    });
  },
  beforeUnmount() {
    socket.off("productAdded");
    socket.off("productUpdated");
    socket.off("productDeleted");
    socket.off("cartUpdated");
  },
  methods: {
    async fetchCart() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/cart");
        this.cartItems = res.data;
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

        // Determine quantity to add.
        // Backend requirement: Min 10 for initial add.
        const inCart = this.cartItems.find(
          (item) => item.product._id === product._id
        );
        const qtyToAdd = inCart ? 1 : 10;

        await axios.post("/api/cart/add", {
          productId: product._id,
          quantity: qtyToAdd,
        });
        this.fetchCart();
      } catch (err) {
        console.error("Error adding to cart:", err);
        const msg = err.response?.data?.msg || "Failed to add to cart";
        alert(msg);
      }
    },
    async updateQty(productId, qty) {
      if (qty < 10) return; // Enforce min 10
      try {
        await axios.post("/api/cart/add", {
          productId,
          quantity: qty,
          overwrite: true,
        });
        this.fetchCart();
      } catch (err) {
        console.error(err);
        const msg = err.response?.data?.msg || "Failed to update quantity";
        alert(msg);
      }
    },
    async removeFromCart(productId) {
      try {
        await axios.delete(`/api/cart/remove/${productId}`);
        this.fetchCart();
      } catch (err) {
        console.error(err);
      }
    },
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get("/api/products/getproduct?filterExpired=true");
        if (res.data.success) this.products = res.data.products;
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
      // In ProductList.vue, it uses: return path.startsWith("/") ? path : `/${path}`;
      // Here UserPage used a slightly different logic. Let's make it consistent.
      const apiUrl = process.env.VUE_APP_API_URL || window.location.origin;
      if (path.startsWith("http")) return path;
      return path.startsWith("/") ? `${apiUrl}${path}` : `${apiUrl}/${path}`;
    },
    getModelUrl(path) {
      if (!path) return null;
      const apiUrl = process.env.VUE_APP_API_URL || window.location.origin;
      if (path.startsWith("http")) return path;
      return path.startsWith("/") ? `${apiUrl}${path}` : `${apiUrl}/${path}`;
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
    async fetchWalletBalance() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("/api/wallet/balance");
        if (res.data.success) this.walletBalance = res.data.balance;
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
      }
    },
    closeScratchCard() {
      this.showScratchCard = false;
      this.scratchCardOrderId = null;
    },
    updateWalletBalance(newBalance) {
      if (typeof newBalance === "number") {
        this.walletBalance = newBalance;
      } else {
        this.fetchWalletBalance();
      }
      this.closeScratchCard();
    },
    toggle3D(product) {
      this.selectedProduct3D = product;
      this.show3DModal = true;
    },
    handleAddToCartFrom3D() {
      if (this.selectedProduct3D) {
        this.addToCart(this.selectedProduct3D);
        this.show3DModal = false;
      }
    },
    loadRazorpay() {
      if (window.Razorpay) return;
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    },
    async fetchUserProfile() {
      try {
        const res = await axios.get("/api/auth/profile");
        this.userProfile = res.data.user;
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    },
    checkProfileCompletion() {
      if (!this.userProfile) return false;
      const requiredFields = [
        "name",
        "phone",
        "pincode",
        "storeName",
        "storeAddress",
      ];
      return requiredFields.every(
        (field) =>
          this.userProfile[field] && this.userProfile[field].trim() !== ""
      );
    },
    async handlePayment() {
      if (!this.checkProfileCompletion()) {
        alert("Please complete your profile with shop details first.");
        this.showProfile = true;
        return;
      }
      if (this.selectedPaymentMethod === "wallet") {
        await this.payWithWallet();
      } else if (this.selectedPaymentMethod === "razorpay") {
        await this.payWithRazorpay();
      }
    },
    async payWithWallet() {
      this.processingPayment = true;
      try {
        const res = await axios.post("/api/orders/place-order-wallet", {
          items: this.cartItems.map((item) => ({
            product: item.product._id,
            quantity: item.quantity,
            price: item.product.discountPrice,
          })),
          totalAmount: this.cartTotal - this.productDiscount,
        });
        this.walletBalance = res.data.newBalance;
        this.orderSuccess(res.data.order._id);
      } catch (err) {
        alert(err.response?.data?.msg || "Wallet payment failed");
      } finally {
        this.processingPayment = false;
      }
    },
    async payWithRazorpay() {
      this.processingPayment = true;
      try {
        const res = await axios.post("/api/orders/create-razorpay-order", {
          amount: this.cartTotal - this.productDiscount,
        });
        const { id: razorpay_order_id, amount, currency } = res.data;

        const options = {
          key: "rzp_test_S03eZU04VsM19U", // Should be from env or config
          amount,
          currency,
          name: "Cochin Distributors POS",
          description: "Order Payment",
          order_id: razorpay_order_id,
          handler: async (response) => {
            try {
              const verifyRes = await axios.post("/api/orders/verify-payment", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                items: this.cartItems.map((item) => ({
                  product: item.product._id,
                  quantity: item.quantity,
                  price: item.product.discountPrice,
                })),
                totalAmount: this.cartTotal - this.productDiscount,
              });
              this.orderSuccess(verifyRes.data.order._id);
            } catch (err) {
              alert("Payment verification failed");
            }
          },
          theme: { color: "#ff9a44" },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        alert("Razorpay order creation failed");
      } finally {
        this.processingPayment = false;
      }
    },
    orderSuccess(orderId) {
      this.cartItems = [];
      this.scratchCardOrderId = orderId;
      this.showScratchCard = true;
      this.selectedPaymentMethod = null;
    },
    handleRevealFromList(orderId, isRevealed, amount) {
      this.scratchCardOrderId = orderId;
      this.scratchCardInitialRevealed = isRevealed || false;
      this.scratchCardInitialAmount = amount || 0;
      this.showScratchCard = true;
      this.showScratchCardsList = false;
    },
    async handleVisualSearch(event) {
      const file = event.target.files[0];
      if (!file) return;

      this.visualSearchLoading = true;
      const formData = new FormData();
      formData.append("image", file);

      try {
        const res = await axios.post("/api/products/search-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.data.success) {
          this.products = res.data.products;
          this.isAiSearch = true;
          this.searchQuery = ""; // Clear text search
          this.selectedCategory = null; 
        }
      } catch (err) {
        console.error("Visual Search Error:", err);
        alert(err.response?.data?.message || "Visual search failed. Please try again.");
      } finally {
        this.visualSearchLoading = false;
        // Reset file input
        event.target.value = '';
      }
    },
    async clearAiSearch() {
      this.isAiSearch = false;
      this.fetchProducts();
    },
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap");

.pos-wrapper {
  display: flex;
  height: 100vh;
  background-color: #f4f7fa;
  font-family: "Outfit", sans-serif;
  color: #333;
  overflow: hidden;
}

/* Sidebar */
.pos-sidebar {
  width: 260px;
  background: white;
  display: flex;
  flex-direction: column;
  padding: 20px 0;
  border-right: 1px solid #e0e6ed;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px 30px;
  cursor: pointer;
}

.brand-logo {
  width: 36px;
  height: 36px;
  background: #ff9a44;
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 20px;
}

.brand-name {
  font-weight: 800;
  font-size: 22px;
  letter-spacing: -0.5px;
}

.user-profile-small {
  padding: 0 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-name {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 2px;
}

.user-role {
  font-size: 12px;
  color: #888;
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 12px;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-section label {
  display: block;
  font-size: 11px;
  text-transform: uppercase;
  color: #999;
  font-weight: 700;
  margin-bottom: 12px;
  padding-left: 12px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: #555;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  transition: all 0.2s;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: #f4f6f8;
  color: #1a1d2e;
}

.nav-item.active {
  background: #f0f4ff;
  color: #2b59ff;
}

.nav-item.active .nav-icon {
  stroke: #2b59ff;
}

.nav-icon {
  width: 18px;
  height: 18px;
  stroke: #637381;
  transition: all 0.2s;
}

.nav-item:hover .nav-icon {
  stroke: #1a1d2e;
}

.badge-new {
  font-size: 10px;
  background: #1a1d2e;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  margin-left: auto;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #f0f0f0;
}

.btn-logout {
  width: 100%;
  padding: 12px;
  background: none;
  border: 1px solid #eee;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #666;
}

/* Main Content */
.pos-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f4f6f9;
  overflow: hidden;
}

.pos-top-nav {
  height: 70px;
  background: white;
  padding: 0 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e0e6ed;
}

.nav-search {
  display: flex;
  align-items: center;
  background: #f4f6f9;
  padding: 8px 16px;
  border-radius: 10px;
  width: 300px;
}

.nav-search input {
  background: none;
  border: none;
  outline: none;
  margin-left: 10px;
  font-size: 14px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.wallet-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0f4ff;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #d0dfff;
  color: #2b59ff;
}

.wallet-pill:hover {
  background: #2b59ff;
  color: white;
}

.wallet-pill .nav-icon {
  stroke: #2b59ff;
  width: 16px;
  height: 16px;
}

.wallet-pill:hover .nav-icon {
  stroke: white;
}

.wallet-amount {
  font-weight: 700;
}

.theme-toggle {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.user-action-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ff9a44;
}

.pos-content {
  flex: 1;
  padding: 30px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-area h1 {
  font-size: 24px;
  font-weight: 800;
  margin: 0 0 4px;
}

.breadcrumb {
  font-size: 13px;
  color: #888;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.btn-orange-new {
  background: #ff9a44;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-white-outlined {
  background: white;
  border: 1px solid #ddd;
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.product-filter-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
}

.filter-input-group {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  padding: 0 16px;
  flex: 1;
  max-width: 400px;
  transition: all 0.3s ease;
}

.filter-input-group:focus-within {
  border-color: #ff9a44;
  box-shadow: 0 0 0 4px rgba(255, 154, 68, 0.1);
}

.btn-visual-search {
  background: none;
  border: none;
  padding: 8px;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-visual-search:hover {
  color: #ff9a44;
  background: #fff8f1;
}

.ai-search-banner {
  grid-column: 1 / -1;
  background: #fff8f1;
  border: 1px dashed #ff9a44;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #ff9a44;
  font-weight: 600;
}

.btn-clear-ai {
  background: #ff9a44;
  color: white;
  border: none;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear-ai:hover {
  background: #ff8522;
  transform: translateY(-1px);
}

.grid-loading {
  grid-column: 1 / -1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #64748b;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #ff9a44;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.filter-input-group input {
  border: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
}

.filter-select {
  padding: 10px 16px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: white;
  font-weight: 600;
  color: #666;
}

.category-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.tab-item {
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  background: white;
  font-weight: 700;
  cursor: pointer;
  color: #666;
  white-space: nowrap;
}

.tab-item.active {
  background: #ff9a44;
  color: white;
}

.pos-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.pos-product-card {
  background: white;
  border-radius: 16px;
  padding: 15px;
  text-align: center;
  position: relative;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.pos-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
}

.product-img {
  width: 100%;
  height: 120px;
  margin-bottom: 15px;
  overflow: hidden;
  border-radius: 12px;
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background-color: #fdfdfd;
}

.product-details .name {
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-details .description {
  font-size: 11px;
  color: #888;
  margin: 0 0 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 30px;
}

.product-details .price {
  font-size: 15px;
  font-weight: 800;
  color: #ff9a44;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.btn-add-cart {
  background: #ff9a44;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-add-cart:hover {
  background: #e68a30;
  transform: scale(1.05);
}

.btn-add-mini {
  position: absolute;
  right: 12px;
  bottom: 12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: #ff9a44;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  z-index: 2;
}

.card-extra-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 5px;
  z-index: 2;
}

.btn-3d-mini {
  background: rgba(26, 29, 46, 0.8);
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 3px;
  backdrop-filter: blur(4px);
}

.btn-3d-mini:hover {
  background: #1a1d2e;
}

/* 3D Modal Styling */
.view3d-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(5px);
}

.view3d-container {
  background: white;
  width: 90%;
  max-width: 800px;
  height: 80vh;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.close-3d {
  position: absolute;
  top: 15px;
  right: 15px;
  background: #f1f1f1;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 10;
  font-weight: bold;
}

.view3d-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.view3d-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.view3d-body {
  flex: 1;
  background: #f9fafb;
  position: relative;
}

.view3d-footer {
  padding: 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
}

/* Payment Selection */
.pos-payment-selection {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.pay-method {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  background: #f8f9fa;
  border: 1px solid #eee;
  cursor: pointer;
  font-weight: 700;
  font-size: 14px;
  transition: all 0.2s;
}

.pay-method input {
  display: none;
}

.pay-method.selected {
  background: #ff9a44;
  color: white;
  border-color: #ff9a44;
}

.pay-method.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f1f1f1;
}

.payment-btn {
  margin-bottom: 12px;
  padding: 18px !important;
  font-size: 16px;
}

.payment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Order Panel */
.pos-order-panel {
  width: 380px;
  background: white;
  border-left: 1px solid #e0e6ed;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px;
}

.search-existing {
  display: flex;
  align-items: center;
  background: #f4f6f9;
  padding: 10px 16px;
  border-radius: 10px;
}

.search-existing input {
  background: none;
  border: none;
  outline: none;
  margin-left: 10px;
  width: 100%;
}

.dining-selectors {
  display: flex;
  gap: 10px;
  padding: 0 20px 20px;
}

.order-select {
  flex: 1;
  padding: 10px;
  border-radius: 10px;
  border: 1px solid #eee;
  background: #f8f9fa;
  font-weight: 600;
}

.current-order-section {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.order-id-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-size: 18px;
}

.order-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 15px;
  position: relative;
}

.item-info .name {
  font-weight: 700;
  margin-bottom: 4px;
}

.item-info .price {
  font-size: 13px;
  color: #666;
}

.item-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.qty-controls {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
}

.qty-controls button {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  font-weight: 700;
}

.qty-controls span {
  width: 30px;
  text-align: center;
  font-weight: 700;
}

.btn-remove {
  position: absolute;
  top: 10px;
  right: 10px;
  background: white;
  border: 1px solid #fee2e2;
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.btn-remove:hover {
  background: #ef4444;
  color: white;
}

.trash-icon {
  width: 14px;
  height: 14px;
}

.btn-add-notes {
  background: none;
  border: none;
  color: #1a1d2e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  text-decoration: underline;
}

.order-summary {
  padding: 24px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.summary-row .editable {
  color: #888;
  cursor: pointer;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding-top: 15px;
  border-top: 1px dashed #ddd;
  margin-top: 15px;
  font-size: 20px;
}

.total-row strong {
  color: #333;
}

.panel-actions {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-navy-full {
  width: 100%;
  background: #1a1d2e;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-white-half {
  width: 100%;
  background: white;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

.dual-actions {
  display: flex;
  gap: 10px;
}

.btn-orange-wide {
  flex: 1.5;
  background: #ff9a44;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

.btn-green-wide {
  flex: 1;
  background: #28a745;
  color: white;
  border: none;
  padding: 15px;
  border-radius: 10px;
  font-weight: 800;
  cursor: pointer;
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #f1f1f1;
}
::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}

@media (max-width: 1400px) {
  .pos-sidebar {
    width: 220px;
  }
  .pos-order-panel {
    width: 320px;
  }
}

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
