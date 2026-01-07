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

        <!-- Payment Method Selection -->
        <div class="payment-options" v-if="showPaymentOptions">
          <h4>Select Payment Method</h4>
          <div class="payment-methods">
            <label class="payment-method">
              <input
                type="radio"
                value="razorpay"
                v-model="selectedPaymentMethod"
              />
              <span class="method-name">Pay with Razorpay</span>
            </label>
            <label class="payment-method" v-if="walletBalance >= totalAmount">
              <input
                type="radio"
                value="wallet"
                v-model="selectedPaymentMethod"
              />
              <span class="method-name"
                >Pay with Wallet (₹{{ walletBalance }})</span
              >
            </label>
            <label class="payment-method" v-else>
              <input
                type="radio"
                value="wallet"
                v-model="selectedPaymentMethod"
                disabled
              />
              <span class="method-name disabled"
                >Pay with Wallet (₹{{ walletBalance }}) - Insufficient
                Balance</span
              >
            </label>
          </div>
        </div>

        <button
          class="place-order-btn"
          @click="handleOrderClick"
          :disabled="showPaymentOptions && !selectedPaymentMethod"
        >
          {{ showPaymentOptions ? "Place Order" : "Select Payment Method" }}
        </button>
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
      selectedPaymentMethod: null,
      walletBalance: 0,
      showPaymentOptions: false,
      userProfile: null,
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
    this.fetchWalletBalance();
    this.fetchUserProfile();
    this.loadRazorpay();
  },
  methods: {
    loadRazorpay() {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      document.body.appendChild(script);
    },
    handleOrderClick() {
      if (!this.checkProfileCompletion()) {
        alert(
          "Please complete your profile with shop details (name, phone, pincode, shop name, shop address) before placing an order."
        );
        this.$emit("show-profile");
        return;
      }
      if (!this.showPaymentOptions) {
        this.showPaymentOptions = true;
      } else {
        this.placeOrder();
      }
    },
    async placeOrder() {
      if (this.cartItems.length === 0 || !this.selectedPaymentMethod) return;

      try {
        const token = localStorage.getItem("token");

        if (this.selectedPaymentMethod === "wallet") {
          // Handle wallet payment
          const res = await axios.post(
            "http://localhost:5000/api/orders/place-order-wallet",
            {
              items: this.cartItems.map((item) => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.product.discountPrice,
              })),
              totalAmount: this.totalAmount,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          alert(res.data.msg);
          this.cartItems = [];
          this.walletBalance = res.data.newBalance;
          this.showPaymentOptions = false;
          this.selectedPaymentMethod = null;
          this.$emit("cart-updated", 0);
          this.$emit("order-placed");
          this.$emit("close");
        } else if (this.selectedPaymentMethod === "razorpay") {
          // Handle Razorpay payment
          // 1. Create order on backend
          const res = await axios.post(
            "http://localhost:5000/api/orders/create-razorpay-order",
            { amount: this.totalAmount },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const { id: razorpay_order_id, amount, currency } = res.data;

          // 2. Open Razorpay checkout
          const options = {
            key: "rzp_test_S03eZU04VsM19U", // Replace with your key
            amount: amount,
            currency: currency,
            name: "Distribution Agency",
            description: "Order Payment",
            order_id: razorpay_order_id,
            handler: async (response) => {
              // 3. Verify payment on backend
              try {
                const verifyRes = await axios.post(
                  "http://localhost:5000/api/orders/verify-payment",
                  {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    items: this.cartItems.map((item) => ({
                      product: item.product._id,
                      quantity: item.quantity,
                      price: item.product.discountPrice,
                    })),
                    totalAmount: this.totalAmount,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                alert(verifyRes.data.msg);
                this.cartItems = [];
                this.showPaymentOptions = false;
                this.selectedPaymentMethod = null;
                this.$emit("cart-updated", 0);
                this.$emit("order-placed");
                this.$emit("close");
                // Redirect to orders page or show success
              } catch (err) {
                console.error("Payment verification failed:", err);
                alert("Payment verification failed. Please contact support.");
              }
            },
            prefill: {
              name: "", // You can populate this from user profile
              email: "",
            },
            theme: {
              color: "#2874f0",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } catch (err) {
        console.error("Error placing order:", err);
        if (err.response && err.response.data && err.response.data.msg) {
          alert(err.response.data.msg);
        } else {
          alert("Failed to place order");
        }
      }
    },
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
    async fetchWalletBalance() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(
          "http://localhost:5000/api/wallet/balance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          this.walletBalance = res.data.balance;
        }
      } catch (err) {
        console.error("Error fetching wallet balance:", err);
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
    async fetchUserProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

.place-order-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Payment Options */
.payment-options {
  margin: 16px 0;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.payment-options h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 500;
  color: #2874f0;
}

.payment-methods {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-method {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.payment-method:hover {
  background: #e3f2fd;
}

.payment-method input[type="radio"] {
  margin-right: 12px;
  accent-color: #2874f0;
}

.method-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.method-name.disabled {
  color: #999;
  text-decoration: line-through;
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
