<template>
  <div class="product-list-wrapper">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <h2 class="page-title">Product Catalog</h2>
        <div class="header-actions">
          <div class="search-bar">
            <i class="fas fa-search search-icon"></i>
            <input
              type="text"
              v-model="searchQuery"
              placeholder="Search by name, brand..."
            />
          </div>
          <div class="sort-dropdown">
            <select v-model="sortBy">
              <option value="newest">Newest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>
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
        <div class="image-container">
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
              :class="getQuantityClass(product.quantity)"
            >
              <span v-if="product.quantity === 0">Out of Stock</span>
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
import axios from "axios";
import ThreeDBox from "@/components/ThreeDBox.vue";

export default {
  name: "ProductList",
  components: {
    ThreeDBox,
  },
  props: {
    isModal: {
      type: Boolean,
      default: false,
    },
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
  },
  methods: {
    getImageUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
    getModelUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
    toggle3D(productId) {
      if (this.active3DProductId === productId) {
        this.active3DProductId = null;
      } else {
        this.active3DProductId = productId;
      }
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
        const res = await axios.get(
          "http://localhost:5000/api/products/getproduct"
        );
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
          `http://localhost:5000/api/products/deleteproduct/${this.deleteId}`
        );
        if (res.data.success) {
          this.products = this.products.filter((p) => p._id !== this.deleteId);
          this.showDeleteModal = false;
          this.deleteId = null;
          if (this.isModal) {
            this.$emit("close");
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
  background: #f1f5f9;
  min-height: 100%;
}

/* Header */
.header-section {
  background: white;
  padding: 16px 24px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 24px;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 250px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-bar input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.search-bar input:focus {
  border-color: #2874f0;
  box-shadow: 0 0 0 3px rgba(40, 116, 240, 0.1);
}

.sort-dropdown select {
  padding: 10px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  color: #475569;
  outline: none;
  cursor: pointer;
  background: white;
}

/* Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
  padding: 0 24px 40px;
  max-width: 1400px;
  margin: 0 auto;
}

.product-card {
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  border-color: #e2e8f0;
}

/* Image Area */
.image-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: white;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s;
}

.product-card:hover .image-container img {
  transform: scale(1.05);
}

.wishlist-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 18px;
}

.discount-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background: #388e3c;
  color: white;
  padding: 4px 8px;
  border-radius: 2px;
  font-size: 11px;
  font-weight: 700;
}

.view-3d-btn {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border: 1px solid #e2e8f0;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #2874f0;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transition: all 0.2s;
}

.product-card:hover .view-3d-btn {
  opacity: 1;
  bottom: 16px;
}

.view-3d-btn:hover {
  background: #2874f0;
  color: white;
  border-color: #2874f0;
}

/* 3D Model Wrapper */
.model-wrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: #fff;
  z-index: 10;
}

.close-3d-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.1);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  transition: all 0.2s;
}

.close-3d-btn:hover {
  background: rgba(0, 0, 0, 0.2);
}

/* Info Area */
.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #212121;
  margin: 0 0 6px 0;
  line-height: 1.4;
  height: 40px; /* Two lines approx */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-desc {
  font-size: 12px;
  color: #878787;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.price-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.current-price {
  font-size: 16px;
  font-weight: 600;
  color: #212121;
}

.original-price {
  font-size: 13px;
  color: #878787;
  text-decoration: line-through;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.rating-badge {
  background: #388e3c;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.stock-status {
  font-size: 12px;
  font-weight: 500;
}

.stock-status.in-stock {
  color: #388e3c;
}
.stock-status.low-stock {
  color: #f57224;
}
.stock-status.out-of-stock {
  color: #d32f2f;
}

/* Actions */
.actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
}

.action-btn {
  flex: 1;
  padding: 8px 0;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 2px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  text-transform: uppercase;
}

.edit-btn {
  color: #2874f0;
  border-color: #2874f0;
}

.edit-btn:hover {
  background: #2874f0;
  color: white;
}

.delete-btn {
  color: #d32f2f;
  border-color: #d32f2f;
}

.delete-btn:hover {
  background: #d32f2f;
  color: white;
}

/* Loading & Empty States */
.loading,
.no-products {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0e0e0;
  border-top: 3px solid #2874f0;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #878787;
}

.modal-body {
  padding: 24px;
}

.warning-text {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 8px;
}

.modal-footer {
  padding: 16px 24px;
  background: #f8f9fa;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn-cancel {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}

.btn-delete {
  padding: 8px 16px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
}
</style>
