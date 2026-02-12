<template>
  <div class="scratch-card-overlay" @click.self="$emit('close')">
    <div class="scratch-card-modal">
      <div class="scratch-card-header">
        <h2>Congratulations! 🎉</h2>
        <p>You've earned a scratch card!</p>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="scratch-card-body">
        <div class="scratch-card-container">
          <div class="scratch-card" :class="{ revealed: isRevealed }">
            <canvas
              ref="scratchCanvas"
              class="scratch-canvas"
              width="300"
              height="200"
              @mousedown="startScratching"
              @mousemove="scratch"
              @mouseup="stopScratching"
              @touchstart="startScratching"
              @touchmove="scratch"
              @touchend="stopScratching"
            ></canvas>

            <div class="scratch-content">
              <div v-if="!isRevealed" class="scratch-text">
                <p>Scratch to reveal your reward!</p>
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
          <p>Scratch the card above to reveal your reward</p>
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
import axios from "axios";

export default {
  name: "ScratchCard",
  props: {
    orderId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      isRevealed: false,
      amount: 0,
      canvas: null,
      ctx: null,
      isScratching: false,
      scratchedPixels: 0,
      totalPixels: 0,
      scratchRadius: 20,
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      this.canvas = this.$refs.scratchCanvas;
      if (!this.canvas) return;

      this.ctx = this.canvas.getContext("2d");
      this.totalPixels = this.canvas.width * this.canvas.height;

      // Create gradient overlay
      const gradient = this.ctx.createLinearGradient(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      gradient.addColorStop(0, "rgba(0, 0, 0, 0.8)");
      gradient.addColorStop(0.5, "rgba(0, 0, 0, 0.9)");
      gradient.addColorStop(1, "rgba(0, 0, 0, 0.8)");

      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      // Add some texture/noise
      this.addTexture();
    },
    addTexture() {
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 50 - 25;
        data[i] = Math.max(0, Math.min(255, data[i] + noise)); // Red
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise)); // Green
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise)); // Blue
      }

      this.ctx.putImageData(imageData, 0, 0);
    },
    getEventPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      let clientX, clientY;
      if (e.touches && e.touches[0]) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      };
    },
    startScratching(e) {
      if (this.isRevealed) return;
      e.preventDefault();
      this.isScratching = true;
      const pos = this.getEventPos(e);
      this.scratchAt(pos.x, pos.y);
    },
    scratch(e) {
      if (!this.isScratching || this.isRevealed) return;
      e.preventDefault();
      const pos = this.getEventPos(e);
      this.scratchAt(pos.x, pos.y);
    },
    stopScratching(e) {
      if (this.isRevealed) return;
      e.preventDefault();
      this.isScratching = false;
      this.checkScratchProgress();
    },
    scratchAt(x, y) {
      this.ctx.save();
      this.ctx.globalCompositeOperation = "destination-out";
      this.ctx.beginPath();
      this.ctx.arc(x, y, this.scratchRadius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    },
    checkScratchProgress() {
      const imageData = this.ctx.getImageData(
        0,
        0,
        this.canvas.width,
        this.canvas.height
      );
      const data = imageData.data;
      let transparentPixels = 0;

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 128) {
          // Alpha channel < 128 means mostly transparent
          transparentPixels++;
        }
      }

      const scratchedPercentage = (transparentPixels / this.totalPixels) * 100;

      if (scratchedPercentage > 60) {
        this.revealCard();
      }
    },
    async revealCard() {
      if (this.isRevealed) return;

      try {
        const token = localStorage.getItem("token");
        const apiUrl = process.env.VUE_APP_API_URL || window.location.origin;
        const res = await axios.post(
          `${apiUrl}/api/orders/scratch-card`,
          { orderId: this.orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.amount = res.data.amount;
        this.isRevealed = true;

        // Clear the entire canvas to show the revealed state
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Emit event to update wallet balance
        this.$emit("wallet-updated", res.data.newBalance);
      } catch (err) {
        console.error("Error revealing scratch card:", err);
        alert("Failed to reveal scratch card. Please try again.");
      }
    },
  },
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
  transition: background 0.3s ease;
}

.scratch-card.revealed {
  background: linear-gradient(135deg, #4caf50, #45a049);
  cursor: default;
}

.scratch-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none; /* Prevent scrolling on touch devices */
}

.scratch-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
}

.scratch-text {
  text-align: center;
  margin-bottom: 20px;
}

.scratch-text p {
  margin: 0 0 10px 0;
  font-weight: 600;
}

.coin-icon {
  font-size: 2rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.revealed-amount {
  text-align: center;
  animation: reveal 0.5s ease-out;
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
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.credit-text {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.9;
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
  line-height: 1.4;
}

.instructions {
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 20px;
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
  transition: background-color 0.3s;
}

.continue-btn:hover {
  background: #45a049;
}

@media (max-width: 480px) {
  .scratch-card-modal {
    width: 95%;
  }

  .scratch-card {
    width: 250px;
    height: 167px;
  }

  .scratch-canvas {
    width: 250px;
    height: 167px;
  }
}
</style>
