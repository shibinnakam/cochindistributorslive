<template>
  <div class="pos-wrapper">
    <!-- Left Sidebar -->
    <aside class="pos-sidebar">
      <div class="sidebar-brand" @click="$router.push('/')">
        <div class="brand-logo">S</div>
        <span class="brand-name">Caterway</span>
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
          <a href="#" class="nav-item"
            ><span class="icon">📊</span> Dashboard</a
          >
          <a href="#" class="nav-item active"
            ><span class="icon">🛒</span> Pos</a
          >
          <a href="#" class="nav-item" @click.prevent="showWallet = true"
            ><span class="icon">👛</span> My Wallet</a
          >
          <a href="#" class="nav-item" @click.prevent="showOrders = true"
            ><span class="icon">📋</span> My Orders</a
          >
          <a href="#" class="nav-item" @click.prevent="showScratchCardsList = true"
            ><span class="icon">🎫</span> Scratchcards</a
          >
          <a href="#" class="nav-item"><span class="icon">🪑</span> Table</a>
          <a href="#" class="nav-item"
            ><span class="icon">📅</span> Reservations</a
          >
        </div>

        <div class="nav-section">
          <label>Offering</label>
          <a href="#" class="nav-item"
            ><span class="icon">🚚</span> Delivery Executive</a
          >
          <a href="#" class="nav-item"
            ><span class="icon">💳</span> Payments
            <span class="badge-new">New</span></a
          >
          <a href="#" class="nav-item"><span class="icon">👤</span> Customer</a>
          <a href="#" class="nav-item"><span class="icon">📄</span> Invoice</a>
        </div>

        <div class="nav-section">
          <label>Back Office</label>
          <a href="#" class="nav-item"
            ><span class="icon">💬</span> Testimonial</a
          >
          <a href="#" class="nav-item"><span class="icon">👥</span> User</a>
          <a href="#" class="nav-item"><span class="icon">📈</span> Reports</a>
          <a href="#" class="nav-item"><span class="icon">⚙️</span> Setting</a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="btn-logout" @click="logout">
          <span class="icon">↩️</span> Login
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <main class="pos-main">
      <!-- Top Navigation -->
      <header class="pos-top-nav">
        <div class="nav-search">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search (Ctrl+/)"
            v-model="searchQuery"
          />
        </div>
        <div class="nav-actions">
          <div class="wallet-pill" @click="showWallet = true">
            <span class="wallet-icon">👛</span>
            <span class="wallet-amount">₹{{ walletBalance }}</span>
          </div>
          <button class="theme-toggle">☀️</button>
          <div class="user-action-avatar">
            <img
              src="https://ui-avatars.com/api/?name=User&background=ddd&color=333"
            />
          </div>
        </div>
      </header>

      <div class="pos-content">
        <div class="content-header">
          <div class="title-area">
            <h1>Point of Sale (POS)</h1>
            <nav class="breadcrumb">Dashboard • Pos</nav>
          </div>
          <div class="header-buttons">
            <button class="btn-orange-new">+ New</button>
            <button class="btn-white-outlined">QR Menu Orders</button>
            <button class="btn-white-outlined">Draft List</button>
            <button class="btn-white-outlined">Table Order</button>
          </div>
        </div>

        <!-- Product Filter Bar -->
        <div class="product-filter-bar">
          <div class="filter-input-group">
            <span class="icon">🔍</span>
            <input
              type="text"
              placeholder="Search in products"
              v-model="searchQuery"
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
          <div v-if="loading" class="grid-loading">Loading...</div>
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
                <span class="icon">📦</span> 3D
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
          <span class="icon">🔍</span>
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
          <span class="icon">🍱</span> <strong>Order #20</strong>
        </div>

        <div class="order-items-list">
          <div v-if="cartItems.length === 0" class="empty-order">
            No items in order
          </div>
          <div v-for="item in cartItems" :key="item._id" class="order-item">
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
              <button
                class="btn-remove"
                @click="removeFromCart(item.product._id)"
              >
                🗑️
              </button>
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
      @close="closeScratchCard"
      @wallet-updated="updateWalletBalance"
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
import ThreeDBox from "@/components/ThreeDBox.vue";

export default {
  name: "UserPage",
  components: {
    ScratchCard,
    ProfilePage,
    WalletPage,
    OrdersPage,
    ScratchCardsPage,
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
      selectedCategory: null,
      showScratchCard: false,
      scratchCardOrderId: null,
      walletBalance: 0,
      show3DModal: false,
      selectedProduct3D: null,
      selectedPaymentMethod: null,
      processingPayment: false,
      userProfile: null,
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
        const res = await axios.get("/api/products/getproduct");
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
          name: "Caterway POS",
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
    handleRevealFromList(orderId) {
      this.scratchCardOrderId = orderId;
      this.showScratchCard = true;
      this.showScratchCardsList = false;
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
  background: #f8f9fa;
  color: #ff9a44;
}

.nav-item.active {
  background: #fff0e1;
  color: #ff9a44;
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
  background: #fff0e1;
  padding: 8px 16px;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #ff9a44;
}

.wallet-pill:hover {
  background: #ff9a44;
  color: white;
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
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  padding: 8px 16px;
  border-radius: 10px;
  border: 1px solid #eee;
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
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
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
