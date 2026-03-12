<template>
  <div class="product-list-wrapper">
    <!-- Header Section -->
    <div class="catalog-header">
      <div class="header-main">
        <h1 class="catalog-title">Product Catalog</h1>
        <p class="catalog-subtitle">Manage and monitor your distribution inventory</p>
      </div>
      
      <div class="header-controls">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products by name, brand, or SKU..."
          />
        </div>
        
        <div class="filter-group">
          <div class="sort-box">
            <span class="filter-label">Sort by</span>
            <select v-model="sortBy">
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
          <button class="btn-refresh" @click="fetchProducts" :disabled="loading">
            <span :class="{ 'spinning': loading }">🔄</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="no-products">
      <div class="empty-state-icon">📦</div>
      <h3>No products found</h3>
      <p>Try adjusting your search or filters</p>
    </div>

    <!-- Product Grid -->
    <div v-else class="products-grid">
      <div
        v-for="product in filteredProducts"
        :key="product._id"
        class="product-card"
      >
        <!-- Image Container -->
        <div
          class="image-container"
          :class="{ expanded: active3DProductId === product._id }"
        >
          <!-- 3D View (Real or Simulated) -->
          <div v-if="active3DProductId === product._id" class="model-wrapper">
            <!-- Real 3D Model -->
            <model-viewer
              v-if="product.model3D"
              :src="getModelUrl(product.model3D)"
              :alt="product.name"
              auto-rotate
              camera-controls
              ar
              shadow-intensity="1"
              style="width: 100%; height: 100%"
            ></model-viewer>

            <!-- Simulated 3D Box -->
            <ThreeDBox
              v-else
              :image="getImageUrl(product.image)"
              :image-front="getImageUrl(product.imageFront)"
              :image-side="getImageUrl(product.imageSide)"
              :image-back="getImageUrl(product.imageBack)"
              :image-top="getImageUrl(product.imageTop)"
              :image-bottom="getImageUrl(product.imageBottom)"
              :shape="product.shape"
            />

            <button class="close-3d-btn" @click.stop="toggle3D(product._id)">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Static Image -->
          <template v-else>
            <img
              :src="
                getImageUrl(product.image) || getImageUrl(product.imageFront)
              "
              :alt="product.name"
            />
            <button class="view-3d-btn" @click.stop="toggle3D(product._id)">
              <i class="fas fa-cube"></i> 3D View
            </button>
          </template>

          <div
            class="discount-badge"
            v-if="
              calculateDiscount(product.originalPrice, product.discountPrice) >
              0
            "
          >
            {{
              calculateDiscount(product.originalPrice, product.discountPrice)
            }}% OFF
          </div>

          <div class="wishlist-icon">
            <i class="far fa-heart"></i>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h3 class="product-name" :title="product.name">{{ product.name }}</h3>
          <p class="product-desc" :title="product.description">
            {{ product.description }}
          </p>

          <!-- Price -->
          <div class="price-container">
            <span class="current-price">₹{{ product.discountPrice }}</span>
            <span
              class="original-price"
              v-if="product.originalPrice > product.discountPrice"
              >₹{{ product.originalPrice }}</span
            >
          </div>

          <div class="meta-row">
            <div
              class="stock-status"
              :class="isProductExpired(product) ? 'out-of-stock' : getQuantityClass(product.quantity)"
            >
              <span v-if="isProductExpired(product)" class="expired-label">PRODUCT EXPIRED</span>
              <span v-else-if="product.quantity === 0">Out of Stock</span>
              <span v-else-if="product.quantity < 10"
                >Only {{ product.quantity }} left!</span
              >
              <span v-else>In Stock</span>
            </div>
            <div class="rating-badge">4.5 <i class="fas fa-star"></i></div>
          </div>

          <!-- Action Buttons -->
          <div class="actions">
            <button
              @click="startEdit(product)"
              class="action-btn edit-btn"
              title="Edit"
            >
              Edit
            </button>
            <button
              @click="openDeleteModal(product._id)"
              class="action-btn delete-btn"
              title="Delete"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" @click="cancelDelete">×</button>
        <div class="modal-header">
          <h3>Delete Product?</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to permanently delete this product?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button @click="cancelDelete" class="btn-cancel">Cancel</button>
          <button @click="confirmDelete" class="btn-delete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";
import socket from "@/socket.js";
import ThreeDBox from "@/components/ThreeDBox.vue";

export default {
  name: "ProductList",
  components: {
    ThreeDBox,
  },
  data() {
    return {
      products: [],
      loading: false,
      searchQuery: "",
      sortBy: "newest",
      deletingId: null,
      showDeleteModal: false,
      deleteId: null,
      active3DProductId: null,
    };
  },
  computed: {
    filteredProducts() {
      let result = [...this.products];

      // Filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(
          (p) =>
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
      }

      // Sort
      switch (this.sortBy) {
        case "priceLow":
          result.sort((a, b) => a.discountPrice - b.discountPrice);
          break;
        case "priceHigh":
          result.sort((a, b) => b.discountPrice - a.discountPrice);
          break;
        case "name":
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case "newest":
        default:
          result.sort(
            (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
          );
          break;
      }

      return result;
    },
  },
  mounted() {
    this.fetchProducts();

    // Socket listeners for real-time updates
    socket.on("productAdded", (data) => {
      this.products.unshift(data.product);
    });

    socket.on("productUpdated", (data) => {
      const index = this.products.findIndex((p) => p._id === data.product._id);
      if (index !== -1) {
        this.products[index] = data.product;
      }
    });

    socket.on("productDeleted", (data) => {
      this.products = this.products.filter((p) => p._id !== data.productId);
    });
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
      return path.startsWith("/") ? path : `/${path}`;
    },
    getModelUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? path : path;
    },
    toggle3D(productId) {
      if (this.active3DProductId === productId) {
        this.active3DProductId = null;
      } else {
        this.active3DProductId = productId;
      }
    },
    isProductExpired(product) {
      if (!product.expiryDate) return false;
      return new Date(product.expiryDate) < new Date();
    },
    calculateDiscount(original, discount) {
      if (!original || !discount) return 0;
      return Math.round(((original - discount) / original) * 100);
    },
    getQuantityClass(quantity) {
      if (quantity === 0) return "out-of-stock";
      if (quantity < 10) return "low-stock";
      return "in-stock";
    },
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get("/api/products/getproduct");
        if (res.data.success) {
          this.products = res.data.products;
        }
      } catch (err) {
        console.error(
          "Error fetching products:",
          err.response?.data || err.message
        );
      } finally {
        this.loading = false;
      }
    },

    // --- Modal Methods ---
    openDeleteModal(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    cancelDelete() {
      this.showDeleteModal = false;
      this.deleteId = null;
    },
    async confirmDelete() {
      this.deletingId = this.deleteId;
      try {
        const res = await axios.delete(
          `/api/products/deleteproduct/${this.deleteId}`
        );
        if (res.data.success) {
          this.products = this.products.filter((p) => p._id !== this.deleteId);
          this.showDeleteModal = false;
          this.deleteId = null;
          if (this.isModal) {
            // No longer needed as it's not a modal
          }
        }
      } catch (err) {
        console.error(
          "Delete product error:",
          err.response?.data || err.message
        );
      } finally {
        this.deletingId = null;
      }
    },

    startEdit(product) {
      this.$emit("edit", product._id);
    },
  },
};
</script>

<style scoped>
.product-list-wrapper {
  padding: 32px;
  background: #f8fafc;
  min-height: 100vh;
}

/* Catalog Header */
.catalog-header {
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.catalog-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
  letter-spacing: -0.02em;
}

.catalog-subtitle {
  color: #64748b;
  margin: 4px 0 0 0;
  font-size: 15px;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  max-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  font-size: 18px;
  opacity: 0.5;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 15px;
  background: white;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-box input:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
  outline: none;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-box {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 46px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sort-box select {
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  outline: none;
  cursor: pointer;
  padding-right: 8px;
}

.btn-refresh {
  width: 46px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.btn-refresh:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

/* Products Grid */
.products-grid {
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #3b82f6;
}

/* Image Section */
.image-container {
  height: 220px;
  padding: 24px;
  background: #fff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f1f5f9;
}

.image-container.expanded {
  height: 450px;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover .image-container img {
  transform: scale(1.1);
}

.discount-badge {
  position: absolute;
  top: 16px;
  left: 16px;
  background: #ef4444;
  color: white;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.3);
}

.wishlist-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.wishlist-icon:hover {
  color: #ef4444;
  background: white;
}

.view-3d-btn {
  position: absolute;
  bottom: 16px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(8px);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transform: translateY(10px);
  transition: all 0.3s;
}

.product-card:hover .view-3d-btn {
  opacity: 1;
  transform: translateY(0);
}

.view-3d-btn:hover {
  background: #3b82f6;
}

/* Info Section */
.product-info {
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 20px 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 20px;
}

.current-price {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
}

.original-price {
  font-size: 16px;
  color: #94a3b8;
  text-decoration: line-through;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.rating-badge {
  background: #f0fdf4;
  color: #166534;
  padding: 6px 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
}

.stock-status {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stock-status.in-stock { color: #10b981; }
.stock-status.low-stock { color: #f59e0b; }
.stock-status.out-of-stock { color: #ef4444; }

/* Action Buttons */
.actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: auto;
}

.action-btn {
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.edit-btn {
  background: #eff6ff;
  color: #2563eb;
}

.edit-btn:hover {
  background: #2563eb;
  color: white;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #dc2626;
  color: white;
}

/* Utils */
.spinning {
  display: inline-block;
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading, .no-products {
  padding: 100px 0;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e2e8f0;
  border-top-color: #3b82f6;
  border-radius: 50%;
  margin: 0 auto 20px;
  animation: rotate 0.8s infinite linear;
}

@media (max-width: 768px) {
  .product-list-wrapper { padding: 16px; }
  .header-controls { flex-direction: column; align-items: stretch; }
  .search-box { max-width: none; }
  .products-grid { grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); }
}
</style>
