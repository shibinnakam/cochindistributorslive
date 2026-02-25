<template>
  <div class="scratch-card-overlay" @click.self="$emit('close')">
    <div class="scratch-card-modal">
      <div class="scratch-card-header">
        <h2>Congratulations! 🎉</h2>
        <p>You've earned a reward!</p>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="scratch-card-body">
        <div class="scratch-card-container">
          <div 
            class="scratch-card" 
            :class="{ revealed: isRevealed }"
            @click="handleCardClick"
          >
            <div class="scratch-content">
              <div v-if="!isRevealed" class="scratch-text">
                <p>Tap to reveal your reward!</p>
                <div class="coin-icon">🪙</div>
              </div>

              <div v-if="isRevealed" class="revealed-amount">
                <div v-if="amount > 0">
                  <div class="amount-text">₹{{ amount }}</div>
                  <p class="credit-text">Credited to your wallet!</p>
                </div>
                <div v-else class="better-luck">
                  <div class="better-luck-emoji">😕</div>
                  <div class="better-luck-text">Better luck next time!</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!isRevealed" class="instructions">
          <p>Tap the card above to reveal your reward</p>
        </div>

        <div v-if="isRevealed" class="success-actions">
          <button class="continue-btn" @click="$emit('close')">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "@/utils/axios";

export default {
  name: "ScratchCard",
  props: {
    orderId: {
      type: String,
      required: true,
    },
    initialRevealed: {
      type: Boolean,
      default: false
    },
    initialAmount: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      isRevealed: this.initialRevealed,
      amount: this.initialAmount,
      loading: false
    };
  },
  methods: {
    async handleCardClick() {
      if (this.isRevealed || this.loading) return;
      await this.revealCard();
    },
    async revealCard() {
      this.loading = true;
      try {
        const res = await axios.post("/api/orders/scratch-card", {
          orderId: this.orderId,
        });

        this.amount = res.data.amount;
        this.isRevealed = true;

        // Emit event to update wallet balance
        this.$emit("wallet-updated", res.data.newBalance);

        // Auto-close after 4 seconds
        setTimeout(() => {
          this.$emit("close");
        }, 4000);
      } catch (err) {
        console.error("Error revealing scratch card:", err);
        alert("Failed to reveal reward. Please try again.");
      } finally {
        this.loading = false;
      }
    },
  },
  watch: {
    initialRevealed(newVal) {
      if (newVal) {
        this.isRevealed = true;
        this.amount = this.initialAmount;
      }
    }
  },
  mounted() {
    if (this.initialRevealed) {
      // Auto-close even for pre-revealed cards if opened from list? 
      // User said: "close in 4 seconds automatically"
      setTimeout(() => {
        this.$emit("close");
      }, 4000);
    }
  }
};
</script>

<style scoped>
.scratch-card-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.scratch-card-modal {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.scratch-card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  position: relative;
}

.scratch-card-header h2 {
  margin: 0 0 8px 0;
  font-size: 1.5rem;
}

.scratch-card-header p {
  margin: 0;
  opacity: 0.9;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  opacity: 0.8;
}

.close-btn:hover {
  opacity: 1;
}

.scratch-card-body {
  padding: 24px;
}

.scratch-card-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.scratch-card {
  position: relative;
  width: 300px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  user-select: none;
  background: linear-gradient(135deg, #ffd700, #ffa500, #ff6347);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
}

.scratch-card:hover:not(.revealed) {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.scratch-card:active:not(.revealed) {
  transform: scale(0.98);
}

.scratch-card.revealed {
  background: linear-gradient(135deg, #4caf50, #45a049);
  cursor: default;
  transform: rotateY(360deg);
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
}

.scratch-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
}

.scratch-text {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.scratch-text p {
  margin: 0 0 10px 0;
  font-weight: 700;
  font-size: 1.1rem;
}

.coin-icon {
  font-size: 2.5rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
}

.revealed-amount {
  animation: reveal 0.5s ease-out forwards;
}

@keyframes reveal {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.amount-text {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.credit-text {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
}

.better-luck {
  padding: 10px;
}

.better-luck-emoji {
  font-size: 3rem;
  margin-bottom: 10px;
}

.better-luck-text {
  font-size: 1.2rem;
  font-weight: 700;
}

.instructions {
  text-align: center;
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 20px;
  font-weight: 500;
}

.success-actions {
  text-align: center;
}

.continue-btn {
  background: #4caf50;
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 6px rgba(76, 175, 80, 0.3);
}

.continue-btn:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

@media (max-width: 480px) {
  .scratch-card-modal {
    width: 95%;
  }

  .scratch-card {
    width: 280px;
    height: 180px;
  }
}
</style>

