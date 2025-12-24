<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>My Cart</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading cart...</p>
        </div>

        <div v-else-if="cartItems.length === 0" class="empty-cart">
          <img src="@/assets/logo.jpeg" alt="Empty Cart" class="empty-img" />
          <p>Your cart is empty!</p>
          <button class="shop-now-btn" @click="$emit('close')">Shop Now</button>
        </div>

        <div v-else class="cart-list">
          <div v-for="item in cartItems" :key="item._id" class="cart-item">
            <div class="item-image">
              <img
                :src="
                  getImageUrl(item.product.image || item.product.imageFront)
                "
                :alt="item.product.name"
              />
            </div>
            <div class="item-details">
              <h3>{{ item.product.name }}</h3>
              <p class="price">₹{{ item.product.discountPrice }}</p>
              <p class="original-price">₹{{ item.product.originalPrice }}</p>

              <div class="quantity-controls">
                <button
                  class="qty-btn"
                  @click="updateQuantity(item.product._id, -1)"
                  :disabled="item.quantity <= 1"
                >
                  -
                </button>
                <span class="qty-value">{{ item.quantity }}</span>
                <button
                  class="qty-btn"
                  @click="updateQuantity(item.product._id, 1)"
                >
                  +
                </button>
              </div>
            </div>
            <div class="item-actions">
              <button class="remove-btn" @click="removeItem(item.product._id)">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer" v-if="cartItems.length > 0">
        <div class="total-section">
          <span>Total Amount:</span>
          <span class="total-price">₹{{ totalAmount }}</span>
        </div>
        <button class="place-order-btn">Place Order</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CartPage",
  data() {
    return {
      cartItems: [],
      loading: false,
    };
  },
  computed: {
    totalAmount() {
      return this.cartItems.reduce((total, item) => {
        return total + item.product.discountPrice * item.quantity;
      }, 0);
    },
  },
  mounted() {
    this.fetchCart();
  },
  methods: {
    async fetchCart() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.cartItems = res.data;
      } catch (err) {
        console.error("Error fetching cart:", err);
      } finally {
        this.loading = false;
      }
    },
    async updateQuantity(productId, change) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:5000/api/cart/add",
          { productId, quantity: change },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update local state
        this.cartItems = res.data.cart;
        this.$emit("cart-updated", this.cartItems.length);
      } catch (err) {
        if (err.response && err.response.data && err.response.data.msg) {
          alert(err.response.data.msg);
        } else {
          console.error("Error updating quantity:", err);
          alert("Failed to update quantity");
        }
      }
    },
    async removeItem(productId) {
      if (!confirm("Are you sure you want to remove this item?")) return;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.delete(
          `http://localhost:5000/api/cart/remove/${productId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.cartItems = res.data.cart;
        this.$emit("cart-updated", this.cartItems.length);
      } catch (err) {
        console.error("Error removing item:", err);
        alert("Failed to remove item");
      }
    },
    getImageUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
  },
};
</script>

<style scoped>
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

.modal-content {
  background: white;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.2rem;
  color: #2874f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #878787;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading {
  text-align: center;
  padding: 40px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2874f0;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.empty-cart {
  text-align: center;
  padding: 40px 0;
}

.empty-img {
  width: 150px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.shop-now-btn {
  background: #2874f0;
  color: white;
  border: none;
  padding: 10px 30px;
  font-size: 16px;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 10px;
}

.cart-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  border: 1px solid #f0f0f0;
  padding: 16px;
  border-radius: 4px;
  gap: 16px;
}

.item-image img {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
}

.price {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.original-price {
  text-decoration: line-through;
  color: #878787;
  font-size: 14px;
  margin: 4px 0 12px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #c2c2c2;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.qty-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qty-value {
  font-weight: 500;
  min-width: 20px;
  text-align: center;
}

.item-actions {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
}

.remove-btn {
  background: none;
  border: none;
  color: #2874f0;
  font-weight: 500;
  cursor: pointer;
  text-transform: uppercase;
  font-size: 14px;
}

.remove-btn:hover {
  text-decoration: underline;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
}

.total-section {
  font-size: 18px;
  font-weight: 500;
}

.total-price {
  font-size: 20px;
  font-weight: 600;
  margin-left: 10px;
}

.place-order-btn {
  background: #fb641b;
  color: white;
  border: none;
  padding: 12px 40px;
  font-size: 16px;
  font-weight: 500;
  border-radius: 2px;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .cart-item {
    flex-direction: column;
  }

  .item-actions {
    flex-direction: row;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
