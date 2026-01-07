<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>My Orders</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading orders...</p>
        </div>

        <div v-else-if="orders.length === 0" class="empty-orders">
          <p>You haven't placed any orders yet!</p>
          <button class="shop-now-btn" @click="$emit('close')">Shop Now</button>
        </div>

        <div v-else class="orders-list">
          <div v-for="order in orders" :key="order._id" class="order-card">
            <div class="order-header">
              <span class="order-id">Order ID: {{ order._id }}</span>
              <span class="order-date">{{ formatDate(order.createdAt) }}</span>
            </div>
            <div class="order-items">
              <div
                v-for="item in order.items"
                :key="item._id"
                class="order-item"
              >
                <img
                  :src="
                    getImageUrl(item.product.image || item.product.imageFront)
                  "
                  :alt="item.product.name"
                  class="item-img"
                />
                <div class="item-info">
                  <h4>{{ item.product.name }}</h4>
                  <p>Qty: {{ item.quantity }} | ₹{{ item.price }}</p>
                </div>
              </div>
            </div>
            <div class="order-footer">
              <span class="order-status" :class="order.status">{{
                order.status
              }}</span>
              <span class="order-total">Total: ₹{{ order.totalAmount }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import socket from "@/socket";

export default {
  name: "OrdersPage",
  data() {
    return {
      orders: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchOrders();
    this.connectSocket();
  },
  beforeUnmount() {
    socket.off("orderStatusUpdate");
  },
  methods: {
    connectSocket() {
      const token = localStorage.getItem("token");
      if (token) {
        socket.emit("join", { token });
        socket.on("orderStatusUpdate", (data) => {
          const { orderId, status } = data;
          const order = this.orders.find((o) => o._id === orderId);
          if (order) {
            order.status = status;
          }
        });
      }
    },
    async fetchOrders() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/orders/my-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.orders = res.data;
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        this.loading = false;
      }
    },
    getImageUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
  z-index: 1001;
}

.modal-content {
  background: white;
  width: 95%;
  max-width: 900px;
  max-height: 90vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
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
  color: #2874f0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.order-card {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  margin-bottom: 20px;
  padding: 16px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  color: #878787;
  font-size: 14px;
}

.order-items {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.order-item {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.item-img {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
  margin-top: 12px;
}

.order-status {
  text-transform: uppercase;
  font-weight: 600;
  font-size: 14px;
}

.order-status.ordered {
  color: #2874f0;
}
.order-status.delivered {
  color: #388e3c;
}
.order-status.cancelled {
  color: #d32f2f;
}

.order-total {
  font-weight: 600;
  font-size: 18px;
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

.loading,
.empty-orders {
  text-align: center;
  padding: 40px;
}

.shop-now-btn {
  background: #2874f0;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 20px;
}
</style>
