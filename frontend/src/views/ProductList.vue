<template>
  <div class="product-list-wrapper">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <div v-else-if="products.length === 0" class="no-products">
      <p>📦 No products found</p>
    </div>

    <!-- Product Grid -->
    <div v-else class="products-row">
      <div v-for="product in products" :key="product._id" class="product-card">
        <!-- Image Container -->
        <div class="image-container">
          <img :src="getImageUrl(product.image)" :alt="product.name" />
          <div
            class="discount-badge"
            v-if="
              calculateDiscount(product.originalPrice, product.discountPrice) >
              0
            "
          >
            -{{
              calculateDiscount(product.originalPrice, product.discountPrice)
            }}%
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <p class="product-desc">{{ product.description }}</p>

          <!-- Price -->
          <div class="price-container">
            <span class="current-price">₹{{ product.discountPrice }}</span>
            <span class="original-price">₹{{ product.originalPrice }}</span>
          </div>

          <!-- Quantity Badge -->
          <div
            class="quantity-badge"
            :class="getQuantityClass(product.quantity)"
          >
            <span v-if="product.quantity === 0">Out of Stock</span>
            <span v-else>{{ product.quantity }} in stock</span>
          </div>

          <!-- Action Buttons -->
          <div class="actions">
            <button @click="startEdit(product)" class="edit-btn" title="Edit">
              <span>📝</span> Edit
            </button>
            <button
              @click="openDeleteModal(product._id)"
              class="delete-btn"
              title="Delete"
            >
              <span>🗑️</span> Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="delete-modal-overlay">
      <div class="delete-modal">
        <div class="delete-modal-icon">⚠️</div>
        <h3>Delete Product?</h3>
        <p>This action cannot be undone.</p>
        <div class="delete-modal-actions">
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
          <button @click="confirmDelete" class="confirm-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductList",
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
      deletingId: null,
      showDeleteModal: false,
      deleteId: null,
    };
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    getImageUrl(path) {
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
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
  padding: 20px;
  background: #f8fafc;
  min-height: 100%;
}

.loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading p {
  color: #64748b;
  font-weight: 500;
}

.no-products {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #94a3b8;
  font-size: 18px;
  font-weight: 500;
}

.products-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.product-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #cbd5e1;
}

.image-container {
  position: relative;
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  overflow: hidden;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}

.discount-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.product-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.product-name {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px 0;
  line-height: 1.3;
  height: 28px;
  overflow: hidden;
}

.product-desc {
  font-size: 12px;
  color: #64748b;
  margin: 0 0 10px 0;
  height: 18px;
  overflow: hidden;
}

.price-container {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #2563eb;
}

.original-price {
  font-size: 13px;
  color: #94a3b8;
  text-decoration: line-through;
}

.quantity-badge {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  margin-bottom: 12px;
  width: fit-content;
}

.quantity-badge.in-stock {
  background: #dcfce7;
  color: #15803d;
}

.quantity-badge.low-stock {
  background: #fef3c7;
  color: #b45309;
}

.quantity-badge.out-of-stock {
  background: #fee2e2;
  color: #b91c1c;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.edit-btn,
.delete-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.edit-btn {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
}

.edit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.delete-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.edit-btn span,
.delete-btn span {
  font-size: 13px;
}

.delete-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.delete-modal {
  background: white;
  padding: 32px;
  border-radius: 12px;
  width: 100%;
  max-width: 360px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.delete-modal-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.delete-modal h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.delete-modal p {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 24px;
}

.delete-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.confirm-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.cancel-btn {
  padding: 10px 24px;
  background: #e2e8f0;
  color: #334155;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: #cbd5e1;
}

@media (max-width: 768px) {
  .products-row {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
  }

  .image-container {
    height: 140px;
  }

  .product-name {
    font-size: 13px;
  }

  .current-price {
    font-size: 16px;
  }
}
</style>
