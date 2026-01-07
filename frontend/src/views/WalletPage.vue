<template>
  <div class="wallet-modal-overlay" @click="$emit('close')">
    <div class="wallet-modal" @click.stop>
      <div class="modal-header">
        <h2>My Wallet</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <!-- Wallet Balance -->
        <div class="balance-section">
          <div class="balance-card">
            <h3>Current Balance</h3>
            <div class="balance-amount">
              <span class="currency">₹</span>
              <span class="amount">{{ balance }}</span>
            </div>
          </div>
        </div>

        <!-- Add Money Section -->
        <div class="add-money-section">
          <h3>Add Money to Wallet</h3>
          <div class="add-money-form">
            <div class="amount-input-group">
              <label for="amount">Enter Amount (₹)</label>
              <input
                type="number"
                id="amount"
                v-model="addAmount"
                placeholder="Enter amount"
                min="1"
                max="10000"
                :disabled="loading"
              />
            </div>
            <button
              class="add-money-btn"
              @click="addMoney"
              :disabled="loading || !addAmount || addAmount < 1"
            >
              {{ loading ? "Processing..." : "Add Money" }}
            </button>
          </div>
        </div>

        <!-- Quick Amount Buttons -->
        <div class="quick-amounts">
          <p>Quick Add:</p>
          <div class="amount-buttons">
            <button @click="setAmount(100)" :disabled="loading">₹100</button>
            <button @click="setAmount(500)" :disabled="loading">₹500</button>
            <button @click="setAmount(1000)" :disabled="loading">₹1000</button>
            <button @click="setAmount(2000)" :disabled="loading">₹2000</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "WalletPage",
  data() {
    return {
      balance: 0,
      addAmount: "",
      loading: false,
    };
  },
  mounted() {
    this.fetchBalance();
  },
  methods: {
    async fetchBalance() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:5000/api/wallet/balance",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.data.success) {
          this.balance = res.data.balance;
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
        alert("Failed to fetch wallet balance");
      }
    },

    setAmount(amount) {
      this.addAmount = amount;
    },

    async addMoney() {
      if (!this.addAmount || this.addAmount < 1) {
        alert("Please enter a valid amount");
        return;
      }

      this.loading = true;
      try {
        const token = localStorage.getItem("token");

        // Create Razorpay order
        const res = await axios.post(
          "http://localhost:5000/api/wallet/add-money",
          { amount: this.addAmount },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          // Initialize Razorpay checkout
          const options = {
            key: res.data.key,
            amount: res.data.amount,
            currency: res.data.currency,
            order_id: res.data.orderId,
            name: "Distribution Agency",
            description: "Add Money to Wallet",
            handler: async (response) => {
              // Verify payment
              await this.verifyPayment(response, res.data.amount);
            },
            prefill: {
              name: "User",
              email: "user@example.com",
            },
            theme: {
              color: "#2874f0",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      } catch (err) {
        console.error("Error creating payment order:", err);
        alert("Failed to initiate payment");
      } finally {
        this.loading = false;
      }
    },

    async verifyPayment(razorpayResponse, amount) {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          "http://localhost:5000/api/wallet/verify-payment",
          {
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            amount: amount,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          alert("Payment successful! Wallet updated.");
          this.balance = res.data.newBalance;
          this.addAmount = "";
        } else {
          alert("Payment verification failed");
        }
      } catch (err) {
        console.error("Error verifying payment:", err);
        alert("Payment verification failed");
      }
    },
  },
};
</script>

<style scoped>
.wallet-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.wallet-modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 20px;
}

.balance-section {
  margin-bottom: 30px;
}

.balance-card {
  background: linear-gradient(135deg, #2874f0, #5ba2f4);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.balance-card h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: 500;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-size: 32px;
  font-weight: bold;
}

.currency {
  font-size: 24px;
  margin-right: 4px;
}

.add-money-section h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 18px;
}

.add-money-form {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.amount-input-group {
  flex: 1;
}

.amount-input-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.amount-input-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.amount-input-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.add-money-btn {
  background-color: #ff9f00;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.add-money-btn:hover:not(:disabled) {
  background-color: #f39400;
}

.add-money-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.quick-amounts {
  border-top: 1px solid #e0e0e0;
  padding-top: 20px;
}

.quick-amounts p {
  margin: 0 0 10px 0;
  font-weight: 500;
  color: #555;
}

.amount-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.amount-buttons button {
  background: white;
  border: 1px solid #2874f0;
  color: #2874f0;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.amount-buttons button:hover:not(:disabled) {
  background-color: #2874f0;
  color: white;
}

.amount-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .wallet-modal {
    width: 95%;
    margin: 20px;
  }

  .add-money-form {
    flex-direction: column;
  }

  .add-money-btn {
    width: 100%;
  }

  .amount-buttons {
    justify-content: center;
  }
}
</style>
