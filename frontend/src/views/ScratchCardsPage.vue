<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>My Scratch Cards</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading scratch cards...</p>
        </div>

        <div v-else-if="scratchCards.length === 0" class="empty-state">
          <div class="empty-icon">🎫</div>
          <h3>No Scratch Cards Available</h3>
          <p>Place more orders to earn exciting scratch card rewards!</p>
          <button class="shop-now-btn" @click="$emit('close')">Shop Now</button>
        </div>

        <div v-else class="scratch-cards-grid">
          <div
            v-for="order in scratchCards"
            :key="order._id"
            class="scratch-card-item"
            @click="openScratchCard(order._id)"
          >
            <div class="card-visual">
              <div class="card-pattern"></div>
              <div class="card-content">
                <span class="card-icon">🎁</span>
                <span class="card-label">Tap to reveal</span>
              </div>
            </div>
            <div class="card-info">
              <p class="order-id">Order #{{ order._id.slice(-6) }}</p>
              <p class="order-date">{{ formatDate(order.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";

export default {
  name: "ScratchCardsPage",
  data() {
    return {
      scratchCards: [],
      loading: false,
    };
  },
  mounted() {
    this.fetchScratchCards();
  },
  methods: {
    async fetchScratchCards() {
      this.loading = true;
      try {
        const res = await axios.get("/api/orders/my-scratchcards");
        this.scratchCards = res.data;
      } catch (err) {
        console.error("Error fetching scratch cards:", err);
      } finally {
        this.loading = false;
      }
    },
    openScratchCard(orderId) {
      this.$emit("reveal-card", orderId);
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
  max-width: 800px;
  max-height: 80vh;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #ff9a44;
  font-weight: 700;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.loading, .empty-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ff9a44;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin-bottom: 8px;
  color: #333;
}

.empty-state p {
  color: #777;
  margin-bottom: 24px;
}

.shop-now-btn {
  background: #ff9a44;
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.scratch-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.scratch-card-item {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #eee;
}

.scratch-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.card-visual {
  height: 140px;
  background: linear-gradient(135deg, #ff9a44 0%, #ff6b6b 100%);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(#fff 2px, transparent 2px);
  background-size: 20px 20px;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.card-icon {
  font-size: 40px;
  margin-bottom: 8px;
}

.card-label {
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-info {
  padding: 12px;
}

.order-id {
  font-weight: 700;
  font-size: 14px;
  margin: 0;
  color: #333;
}

.order-date {
  font-size: 12px;
  color: #888;
  margin: 4px 0 0;
}

@media (max-width: 480px) {
  .scratch-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 15px;
  }
}
</style>
