<template>
  <div class="admin-orders-container">
    <div class="section-card">
      <div class="section-header">
        <h3>Order Management</h3>
        <button class="btn-refresh" @click="fetchOrders">Refresh</button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading orders...</p>
      </div>

      <div v-else-if="orders.length === 0" class="empty-state">
        <p>No orders found.</p>
      </div>

      <div v-else class="orders-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User Details</th>
              <th>Products</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order._id">
              <td>#{{ order._id.slice(-6) }}</td>
              <td>
                <div class="user-info">
                  <strong>{{ order.user?.name || "N/A" }}</strong>
                  <span>Merchant: {{ order.user?.storeName || "N/A" }}</span>
                  <small>Phone: {{ order.user?.phone || "N/A" }}</small>
                  <small
                    >Address: {{ order.user?.storeAddress || "N/A" }}</small
                  >
                  <small>Pincode: {{ order.user?.pincode || "N/A" }}</small>
                </div>
              </td>
              <td>
                <div class="products-list">
                  <div
                    v-for="item in order.items"
                    :key="item._id"
                    class="product-item"
                  >
                    {{ item.product?.name || "N/A" }} (x{{ item.quantity }})
                  </div>
                </div>
              </td>
              <td>₹{{ order.totalAmount }}</td>
              <td>
                <span class="status-badge" :class="order.status">{{
                  order.status
                }}</span>
              </td>
              <td>{{ formatDate(order.createdAt) }}</td>
              <td>
                <div class="actions">
                  <select
                    v-model="order.status"
                    @change="updateStatus(order._id, order.status)"
                    class="status-select"
                  >
                    <option value="ordered">Ordered</option>
                    <option value="accepted">Accepted</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AdminOrders",
  data() {
    return {
      orders: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchOrders();
  },
  methods: {
    async fetchOrders() {
      this.loading = true;
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/orders/admin/all-orders",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        this.orders = res.data;
      } catch (err) {
        console.error("Error fetching admin orders:", err);
      } finally {
        this.loading = false;
      }
    },
    async updateStatus(orderId, newStatus) {
      try {
        const token = localStorage.getItem("token");
        await axios.patch(
          `http://localhost:5000/api/orders/admin/orders/${orderId}/status`,
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Order status updated successfully");
      } catch (err) {
        console.error("Error updating order status:", err);
        alert("Failed to update status");
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.admin-orders-container {
  padding: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info strong {
  color: #333;
}

.user-info span {
  font-size: 0.85rem;
  color: #666;
}

.user-info small {
  font-size: 0.75rem;
  color: #888;
}

.products-list {
  max-height: 100px;
  overflow-y: auto;
}

.product-item {
  font-size: 0.85rem;
  margin-bottom: 2px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.ordered {
  background: #e3f2fd;
  color: #1976d2;
}
.status-badge.accepted {
  background: #f3e5f5;
  color: #7b1fa2;
}
.status-badge.shipped {
  background: #fff3e0;
  color: #f57c00;
}
.status-badge.delivered {
  background: #e8f5e9;
  color: #388e3c;
}
.status-badge.cancelled {
  background: #ffebee;
  color: #d32f2f;
}

.status-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.85rem;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
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

.btn-refresh {
  background: #3498db;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-refresh:hover {
  background: #2980b9;
}
</style>
