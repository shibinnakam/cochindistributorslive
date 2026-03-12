<template>
  <div class="product-list-wrapper">
    <!-- Header Section -->
    <div class="catalog-header">
      <div class="header-main">
        <h1 class="catalog-title">Product Catalog</h1>
        <nav class="breadcrumb">Admin • Inventory Management</nav>
      </div>
      
      <div class="header-controls">
        <div class="search-box">
          <svg class="search-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search products..."
          />
        </div>
        
        <div class="filter-group">
          <select v-model="sortBy" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="name">Name: A-Z</option>
          </select>
          <button class="btn-refresh" @click="fetchProducts" :disabled="loading">
            <span :class="{ 'spinning': loading }">🔄</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Content Section -->
    <div v-if="loading" class="grid-loading">
      <div class="loading-spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else-if="filteredProducts.length === 0" class="no-products">
      <div class="empty-state-icon">📦</div>
      <h3>No products found</h3>
      <p>Try adjusting your search or filters</p>
    </div>

    <!-- Product Grid -->
    <div v-else class="admin-product-grid">
      <div
        v-for="product in filteredProducts"
        :key="product._id"
        class="admin-product-card"
      >
        <!-- Card Extra Actions (Top Right) -->
        <div class="card-extra-actions">
          <button class="btn-3d-mini" @click.stop="toggle3D(product._id)">
            <svg class="nav-icon-small" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            3D
          </button>
        </div>

        <!-- Image Container -->
        <div class="product-img-container" :class="{ expanded: active3DProductId === product._id }">
          <div v-if="active3DProductId === product._id" class="model-wrapper">
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
          </div>
          <img
            v-else
            :src="getImageUrl(product.image || product.imageFront)"
            :alt="product.name"
          />
          
          <!-- Badges -->
          <div class="card-badges">
            <div
              class="badge discount"
              v-if="calculateDiscount(product.originalPrice, product.discountPrice) > 0"
            >
              {{ calculateDiscount(product.originalPrice, product.discountPrice) }}% OFF
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="product-details">
          <h3 class="name">{{ product.name }}</h3>
          <p class="description">{{ product.description }}</p>
          
          <div class="status-row">
            <div
              class="stock-status"
              :class="isProductExpired(product) ? 'out-of-stock' : getQuantityClass(product.quantity)"
            >
              <template v-if="isProductExpired(product)">PRODUCT EXPIRED</template>
              <template v-else-if="product.quantity === 0">Out of Stock</template>
              <template v-else-if="product.quantity < 10">Only {{ product.quantity }} left!</template>
              <template v-else>IN STOCK</template>
            </div>
            <div class="rating">4.5 <i class="fas fa-star"></i></div>
          </div>

          <div class="price-row">
            <div class="pricing">
              <span class="price">₹{{ product.discountPrice }}</span>
              <span class="old-price" v-if="product.originalPrice > product.discountPrice">₹{{ product.originalPrice }}</span>
            </div>
          </div>

          <!-- Admin Specific Actions -->
          <div class="admin-actions">
            <button @click="startEdit(product)" class="btn-action edit">Edit</button>
            <button @click="openDeleteModal(product._id)" class="btn-action delete">Delete</button>
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
        this.$set(this.products, index, data.product);
      }
    });

    socket.on("productDeleted", (data) => {
      this.products = this.products.filter((p) => p._id !== data.productId);
    });
  },
  beforeUnmount() {
    socket.off("productAdded");
    socket.off("productUpdated");
    socket.off("productDeleted");
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
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
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap");

.product-list-wrapper {
  padding: 30px;
  background: transparent;
  width: 100%;
  font-family: 'Outfit', sans-serif;
}

/* Catalog Header */
.catalog-header {
  margin-bottom: 30px;
}

.catalog-title {
  font-size: 24px;
  font-weight: 800;
  color: #1a1d2e;
  margin: 0 0 5px;
}

.breadcrumb {
  font-size: 13px;
  color: #888;
  font-weight: 500;
}

.header-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 25px;
  gap: 15px;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 12px;
  padding: 0 15px;
  flex: 1;
  max-width: 400px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: #ff9a44;
  box-shadow: 0 0 0 4px rgba(255, 154, 68, 0.1);
}

.search-icon-svg {
  width: 18px;
  height: 18px;
  color: #64748b;
  margin-right: 10px;
}

.search-box input {
  border: none;
  outline: none;
  padding: 12px 0;
  width: 100%;
  font-family: inherit;
  font-size: 14px;
}

.filter-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.filter-select {
  padding: 10px 15px;
  border-radius: 10px;
  border: 1px solid #e0e6ed;
  background: white;
  font-weight: 600;
  color: #1a1d2e;
  font-family: inherit;
  font-size: 14px;
}

.btn-refresh {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e0e6ed;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-refresh:hover {
  background: #f8fafc;
}

/* Product Grid */
.admin-product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.admin-product-card {
  background: white;
  border-radius: 18px;
  padding: 15px;
  text-align: center;
  position: relative;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  border: 1px solid #f1f5f9;
  display: flex;
  flex-direction: column;
}

.admin-product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.product-img-container {
  width: 100%;
  height: 140px;
  margin-bottom: 20px;
  overflow: hidden;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fdfdfd;
}

.product-img-container.expanded {
  height: 250px;
}

.product-img-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

/* Card Actions Overlays */
.card-extra-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
}

.btn-3d-mini {
  background: rgba(26, 29, 46, 0.85);
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

.card-badges {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
}

.badge.discount {
  background: #ff4d4d;
  color: white;
}

/* Product Info */
.product-details {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.product-details .name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1d2e;
  margin: 0 0 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-details .description {
  font-size: 12px;
  color: #888;
  margin: 0 0 12px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 32px;
  line-height: 1.4;
}

.status-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.stock-status {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.stock-status.in-stock { color: #22c55e; }
.stock-status.low-stock { color: #f59e0b; }
.stock-status.out-of-stock { color: #ef4444; }

.rating {
  font-size: 11px;
  font-weight: 700;
  color: #22c55e;
  display: flex;
  align-items: center;
  gap: 3px;
}

.price-row {
  margin-top: auto;
  margin-bottom: 15px;
}

.pricing {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.price {
  font-size: 18px;
  font-weight: 800;
  color: #1a1d2e;
}

.old-price {
  font-size: 13px;
  color: #cbd5e1;
  text-decoration: line-through;
}

/* Admin Specific Actions */
.admin-actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  flex: 1;
  padding: 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-action.edit {
  background: #eff6ff;
  color: #3b82f6;
}

.btn-action.edit:hover {
  background: #3b82f6;
  color: white;
}

.btn-action.delete {
  background: #fef2f2;
  color: #ef4444;
}

.btn-action.delete:hover {
  background: #ef4444;
  color: white;
}

/* Loading & No Results */
.grid-loading {
  text-align: center;
  padding: 50px 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #ff9a44;
  border-radius: 50%;
  animation: rotate 1s linear infinite;
  margin: 0 auto 15px;
}

.no-products {
  text-align: center;
  padding: 80px 0;
  color: #64748b;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
  text-align: center;
}

.modal-close {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
}

.modal-header h3 {
  margin: 0 0 15px;
  font-weight: 800;
}

.warning-text {
  color: #ef4444;
  font-size: 13px;
  font-weight: 600;
  margin-top: 5px;
}

.modal-footer {
  display: flex;
  gap: 12px;
  margin-top: 25px;
}

.btn-cancel {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: #f1f5f9;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

.btn-delete {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  background: #ef4444;
  color: white;
  border: none;
  font-weight: 700;
  cursor: pointer;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinning {
  display: inline-block;
  animation: rotate 1s linear infinite;
}

@media (max-width: 640px) {
  .admin-product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 15px;
  }
  .header-controls {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
