<template>
  <div class="product-list-wrapper">
    <h2>All Products</h2>

    <div v-if="loading" class="loading">Loading products...</div>

    <div v-else-if="products.length === 0" class="no-products">
      No products found.
    </div>

    <!-- ✅ Horizontal scroll container -->
    <div v-else class="products-row">
      <div v-for="product in products" :key="product._id" class="product-card">
        <!-- Product Image -->
        <img :src="getImageUrl(product.image)" alt="Product Image" />

        <!-- Product Name -->
        <h3>{{ product.name }}</h3>

        <!-- Product Description -->
        <p class="description">{{ product.description }}</p>

        <!-- Price Section -->
        <div class="price-section">
          <span class="discount-price">₹{{ product.discountPrice }}</span>
          <span class="original-price">₹{{ product.originalPrice }}</span>
          <span class="discount-percent">
            ({{
              calculateDiscount(product.originalPrice, product.discountPrice)
            }}% off)
          </span>
        </div>

        <!-- Quantity Section -->
        <div class="quantity-status">
          <span v-if="product.quantity === 0" class="out-of-stock"
            >Out of Stock</span
          >
          <span v-else-if="product.quantity < 10" class="few-left">
            Few left ({{ product.quantity }})
          </span>
          <span v-else class="in-stock">
            Available: {{ product.quantity }}
          </span>
        </div>

        <!-- Action Buttons -->
        <div class="actions">
          <button @click="openDeleteModal(product._id)" class="delete-btn">
            Delete
          </button>
          <button @click="startEdit(product)" class="update-btn">Update</button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Are you sure you want to permanently delete this product?</h3>
        <p>This action cannot be undone.</p>
        <div class="modal-actions">
          <button @click="confirmDelete" class="confirm-btn">Delete</button>
          <button @click="cancelDelete" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductList",
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
        }
      } catch (err) {
        console.error(
          "Delete product error:",
          err.response?.data || err.message
        );
      } finally {
        this.deletingId = null;
        this.showDeleteModal = false;
        this.deleteId = null;
      }
    },

    startEdit(product) {
      this.$router.push(`/products/edit/${product._id}`);
    },
  },
};
</script>

<style scoped>
.product-list-wrapper {
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  overflow-x: auto; /* ✅ enable horizontal scroll */
}

.products-row {
  display: flex;
  gap: 20px;
  flex-wrap: nowrap; /* ✅ keep in one row */
}

/* ✅ Product Card */
.product-card {
  min-width: 180px;
  max-width: 190px;
  background: #fff;
  border-radius: 18px; /* more rounded corners */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); /* stronger shadow */
  padding: 20px;
  text-align: center; /* center everything like Bingo card */
  flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.product-card:hover {
  transform: translateY(-5px); /* hover lift effect */
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  border: 1px solid gold;
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: contain;
  margin: 12px 0;
}

.product-card h3 {
  margin: 2px 0;
  font-size: 18px;
  font-weight: 700;
  color: #000;
}

.description {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
  height: 13px;
  overflow: hidden;
}

.price-section {
  margin-bottom: 7px;
}

.original-price {
  text-decoration: line-through;
  color: #888;
  margin-right: 6px;
  font-size: 14px;
}

.discount-price {
  color: #000;
  font-weight: bold;
  font-size: 16px;
  margin-right: 6px;
}

.discount-percent {
  color: green;
  font-size: 14px;
  font-weight: 500;
}

.quantity-status {
  margin-bottom: 3px;
  font-size: 14px;
  font-weight: 500;
}

.out-of-stock {
  color: red;
}

.few-left {
  color: violet;
}

.in-stock {
  color: green;
}

.actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background-color: #cc0000;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}

.delete-btn:hover {
  background-color: #990000;
}

.update-btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background-color: #0066cc;
  color: #fff;
  cursor: pointer;
  transition: 0.3s;
}

.update-btn:hover {
  background-color: #004c99;
}

/* --- Modal Styling --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  text-align: center;
}
.modal h3 {
  font-size: 16px;
  margin-bottom: 10px;
}
.modal p {
  font-size: 14px;
  margin-bottom: 20px;
  color: #666;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.confirm-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #d10000ff, #b20707ff);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.cancel-btn {
  padding: 8px 16px;
  background: #eee;
  color: #333;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
</style>
