<template>
  <div class="flipkart-layout">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo-section">
          <img src="@/assets/logo.jpeg" alt="Logo" class="logo" />
          <span class="brand-name">Distribution Agency</span>
        </div>

        <div class="search-bar">
          <input
            type="text"
            placeholder="Search for products, brands and more"
            v-model="searchQuery"
          />
          <button
            class="camera-btn"
            @click="triggerImageUpload"
            title="Search by Image"
          >
            📷
          </button>
          <button class="search-btn">🔍</button>
          <input
            type="file"
            ref="imageInput"
            @change="handleImageSearch"
            accept="image/*"
            style="display: none"
          />
        </div>

        <div class="nav-links">
          <div class="nav-item user-menu">
            <span>{{ userName || "User" }}</span>
            <div class="dropdown">
              <a href="#" @click.prevent="showProfile = true">My Profile</a>
              <a href="#" @click.prevent="logout">Logout</a>
            </div>
          </div>
          <div class="nav-item">
            <span>Become a Seller</span>
          </div>
          <div class="nav-item">
            <span>More</span>
          </div>
          <div class="nav-item cart" @click="showCart = true">
            <span
              >🛒 Cart
              <span v-if="cartCount > 0" class="cart-badge">{{
                cartCount
              }}</span></span
            >
          </div>
        </div>
      </div>
    </nav>

    <!-- Categories Bar -->
    <div class="categories-bar">
      <div
        class="category-item"
        v-for="cat in categories"
        :key="cat._id"
        @click="selectCategory(cat)"
        :class="{ active: selectedCategory === cat._id }"
      >
        <div class="cat-img-placeholder">
          <img
            v-if="cat.image"
            :src="getImageUrl(cat.image)"
            :alt="cat.name"
            class="cat-img"
          />
        </div>
        <span>{{ cat.name }}</span>
      </div>
    </div>

    <!-- Welcome Banner -->
    <div v-if="showWelcome" class="welcome-banner">
      <div class="welcome-content">
        <span class="welcome-text"
          >Welcome back, <b>{{ userName }}</b
          >! Explore our latest collection.</span
        >
        <button class="close-welcome" @click="showWelcome = false">✕</button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Banner (Placeholder) -->
      <div class="banner-section">
        <div class="banner">
          <h2>Big Savings on Distribution Products!</h2>
          <p>Shop now for the best deals.</p>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="product-section">
        <h3>Latest Products</h3>

        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading products...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="no-products">
          <p>No products found.</p>
        </div>

        <div v-else class="products-grid">
          <div
            v-for="product in filteredProducts"
            :key="product._id"
            class="product-card"
          >
            <div class="image-wrapper">
              <!-- 3D View Toggle -->
              <div
                v-if="active3DProductId === product._id"
                class="model-container"
              >
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
                <button class="close-3d" @click.stop="toggle3D(product._id)">
                  ✕
                </button>
              </div>
              <template v-else>
                <img
                  :src="getImageUrl(product.image || product.imageFront)"
                  :alt="product.name"
                  class="product-img"
                />
                <button
                  class="view-3d-btn"
                  @click.stop="toggle3D(product._id)"
                  v-if="has3DImages(product)"
                >
                  3D View
                </button>
              </template>

              <div class="wishlist-icon">❤</div>
            </div>

            <div class="product-details">
              <h3 class="product-title" :title="product.name">
                {{ product.name }}
              </h3>
              <div class="rating-badge">4.4 ★</div>
              <div class="price-row">
                <span class="current-price">₹{{ product.discountPrice }}</span>
                <span class="original-price">₹{{ product.originalPrice }}</span>
                <span class="discount"
                  >{{
                    calculateDiscount(
                      product.originalPrice,
                      product.discountPrice
                    )
                  }}% off</span
                >
              </div>
              <div class="offers">
                <span>Free delivery</span>
              </div>
              <button class="add-to-cart-btn" @click.stop="addToCart(product)">
                ADD TO CART
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Profile Modal -->
    <ProfilePage v-if="showProfile" @close="showProfile = false" />

    <!-- Cart Modal -->
    <CartPage
      v-if="showCart"
      @close="showCart = false"
      @cart-updated="cartCount = $event"
    />

    <!-- ChatBot -->
    <ChatBot :categories="categories" :products="products" />
  </div>
</template>

<script>
import axios from "axios";
import ThreeDBox from "@/components/ThreeDBox.vue";
import ChatBot from "@/components/ChatBot.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import CartPage from "@/views/CartPage.vue";

export default {
  name: "UserPage",
  components: {
    ThreeDBox,
    ChatBot,
    ProfilePage,
    CartPage,
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
      showWelcome: true,
      selectedCategory: null,
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
        const res = await axios.post(
          "http://localhost:5000/api/products/search-image",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

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
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
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
        await axios.post(
          "http://localhost:5000/api/cart/add",
          { productId: product._id, quantity: 1 },
          { headers: { Authorization: `Bearer ${token}` } }
        );
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
        const res = await axios.get(
          "http://localhost:5000/api/products/getproduct"
        );
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
        const res = await axios.get("http://localhost:5000/api/categories");
        this.categories = Array.isArray(res.data)
          ? res.data
          : res.data.categories || [];
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    },
    getImageUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
    calculateDiscount(original, discount) {
      if (!original || !discount) return 0;
      return Math.round(((original - discount) / original) * 100);
    },
    toggle3D(productId) {
      this.active3DProductId =
        this.active3DProductId === productId ? null : productId;
    },
    has3DImages(product) {
      return product.model3D || (product.imageFront && product.imageBack);
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    selectCategory(cat) {
      if (this.selectedCategory === cat._id) {
        this.selectedCategory = null; // Deselect if already selected
      } else {
        this.selectedCategory = cat._id;
      }
    },
  },
};
</script>

<style scoped>
.flipkart-layout {
  font-family: Roboto, Arial, sans-serif;
  background-color: #f1f3f6;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navbar */
.navbar {
  background-color: #2874f0;
  color: white;
  height: 56px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-container {
  max-width: 1248px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 20px;
  gap: 20px;
}

.logo-section {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.logo {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 8px;
}

.brand-name {
  font-weight: bold;
  font-style: italic;
  font-size: 1.2rem;
}

.search-bar {
  flex: 1;
  display: flex;
  background: white;
  border-radius: 2px;
  padding: 0 10px;
  height: 36px;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.camera-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0 10px;
  display: flex;
  align-items: center;
}
.camera-btn:hover {
  opacity: 0.7;
}

.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 14px;
  padding: 0 10px;
}

.search-btn {
  background: none;
  border: none;
  color: #2874f0;
  cursor: pointer;
  font-size: 16px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;
  font-weight: 500;
}

.nav-item {
  cursor: pointer;
  font-size: 16px;
  white-space: nowrap;
}

.user-menu {
  background: white;
  color: #2874f0;
  padding: 4px 20px;
  border-radius: 2px;
  border: 1px solid #dbdbdb;
  position: relative;
}

.user-menu:hover .dropdown {
  display: block;
}

.dropdown {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  min-width: 150px;
  z-index: 10;
}

/* Welcome Banner */
.welcome-banner {
  background: linear-gradient(90deg, #2874f0, #5ba2f4);
  color: white;
  padding: 12px 20px;
  text-align: center;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.5s ease-out;
}

.welcome-content {
  max-width: 1248px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  font-size: 16px;
  font-weight: 500;
}

.close-welcome {
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  opacity: 0.8;
  position: absolute;
  right: 20px;
}

.close-welcome:hover {
  opacity: 1;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Category Images */
.category-item {
  cursor: pointer;
  transition: transform 0.2s;
  padding: 5px;
  border-radius: 8px;
}

.category-item:hover {
  transform: scale(1.05);
}

.category-item.active {
  background-color: #e0f7fa; /* Light blue highlight */
  border: 1px solid #2874f0;
}

.cat-img-placeholder {
  width: 64px;
  height: 64px;
  background-color: #fff;
  border-radius: 50%;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cat-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dropdown a {
  display: block;
  padding: 10px 15px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
}

.dropdown a:hover {
  background-color: #f5f5f5;
}

/* Categories Bar */
.categories-bar {
  background: white;
  padding: 10px 0;
  display: flex;
  justify-content: center;
  gap: 40px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  min-width: 80px;
}

.cat-img-placeholder {
  width: 64px;
  height: 64px;
  background-color: #e0e0e0;
  border-radius: 50%;
  margin-bottom: 8px;
}

.category-item span {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* Main Content */
.main-content {
  max-width: 1248px;
  margin: 10px auto;
  width: 100%;
  padding: 10px;
  flex: 1;
}

.banner-section {
  margin-bottom: 10px;
}

.banner {
  background: linear-gradient(90deg, #2874f0, #0056b3);
  color: white;
  padding: 40px;
  border-radius: 4px;
  text-align: center;
}

/* Product Grid */
.product-section {
  background: white;
  padding: 16px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.product-section h3 {
  font-size: 22px;
  margin-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  padding: 16px;
  transition: box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  position: relative;
}

.product-card:hover {
  box-shadow: 0 3px 16px rgba(0, 0, 0, 0.1);
}

.image-wrapper {
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12px;
  position: relative;
}

.product-img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}

.model-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.close-3d {
  position: absolute;
  top: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
}

.view-3d-btn {
  position: absolute;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  padding: 4px 8px;
  font-size: 12px;
  border-radius: 12px;
  cursor: pointer;
  color: #2874f0;
  font-weight: bold;
}

.wishlist-icon {
  position: absolute;
  top: 0;
  right: 0;
  color: #c2c2c2;
  cursor: pointer;
  font-size: 20px;
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-title {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin: 0 0 6px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

.rating-badge {
  background-color: #388e3c;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
  width: fit-content;
  margin-bottom: 8px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 4px;
}

.current-price {
  font-size: 18px;
  font-weight: 500;
  color: #212121;
}

.original-price {
  font-size: 14px;
  color: #878787;
  text-decoration: line-through;
}

.discount {
  font-size: 13px;
  color: #388e3c;
  font-weight: 500;
}

.offers {
  font-size: 12px;
  color: #212121;
}

.loading,
.no-products {
  text-align: center;
  padding: 40px;
  color: #878787;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2874f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.add-to-cart-btn {
  background-color: #ff9f00;
  color: white;
  border: none;
  padding: 10px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 10px;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.add-to-cart-btn:hover {
  background-color: #f39400;
}

.cart-badge {
  background-color: #ff6161;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 10px;
  vertical-align: top;
  margin-left: 4px;
}

@media (max-width: 768px) {
  .nav-links span {
    display: none;
  }
  .nav-links .cart span {
    display: block;
  }
  .categories-bar {
    justify-content: flex-start;
    padding: 10px 20px;
  }
}
</style>
