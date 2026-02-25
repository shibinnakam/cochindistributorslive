<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <div class="header-title">
          <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          <h2>My Invoices</h2>
        </div>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>Loading invoices...</p>
        </div>

        <div v-else-if="invoices.length === 0" class="empty-state">
          <p>No invoices found. Place an order to generate an invoice!</p>
          <button class="shop-now-btn" @click="$emit('close')">Shop Now</button>
        </div>

        <div v-else class="invoices-container">
          <!-- List View -->
          <div v-if="!selectedInvoice" class="invoices-list">
            <div v-for="invoice in invoices" :key="invoice._id" class="invoice-row" @click="selectedInvoice = invoice">
              <div class="invoice-info">
                <span class="inv-number">{{ invoice.invoiceNumber }}</span>
                <span class="inv-date">{{ formatDate(invoice.createdAt) }}</span>
              </div>
              <div class="invoice-status">
                <span class="status-badge paid">Paid</span>
                <span class="inv-amount">₹{{ invoice.totalAmount }}</span>
                <svg class="chevron-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
              </div>
            </div>
          </div>

          <!-- Detail View -->
          <div v-else class="invoice-detail">
            <button class="back-btn" @click="selectedInvoice = null">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              Back to List
            </button>

            <div class="invoice-paper">
              <div class="paper-header">
                <div class="company-info">
                  <h3>Caterway Invoices</h3>
                  <p>Order ID: {{ selectedInvoice.order }}</p>
                </div>
                <div class="invoice-meta">
                  <h1>INVOICE</h1>
                  <p><strong>No:</strong> {{ selectedInvoice.invoiceNumber }}</p>
                  <p><strong>Date:</strong> {{ formatDate(selectedInvoice.createdAt) }}</p>
                </div>
              </div>

              <table class="invoice-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th class="text-right">Price</th>
                    <th class="text-center">Qty</th>
                    <th class="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, idx) in selectedInvoice.items" :key="idx">
                    <td>{{ item.productName }}</td>
                    <td class="text-right">₹{{ item.price }}</td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-right">₹{{ item.price * item.quantity }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-right"><strong>Total Amount</strong></td>
                    <td class="text-right"><strong>₹{{ selectedInvoice.totalAmount }}</strong></td>
                  </tr>
                </tfoot>
              </table>

              <div class="paper-footer">
                <div class="payment-details">
                  <p><strong>Payment Method:</strong> {{ selectedInvoice.paymentMethod }}</p>
                  <p v-if="selectedInvoice.paymentId"><strong>Transaction ID:</strong> {{ selectedInvoice.paymentId }}</p>
                </div>
                <div class="thank-you">
                  <p>Thank you for choosing Caterway!</p>
                </div>
              </div>
            </div>
            
            <div class="action-buttons">
              <button class="print-btn" @click="printInvoice">Print Invoice</button>
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
  name: "InvoicesPage",
  data() {
    return {
      invoices: [],
      selectedInvoice: null,
      loading: false
    };
  },
  mounted() {
    this.fetchInvoices();
  },
  methods: {
    async fetchInvoices() {
      this.loading = true;
      try {
        const res = await axios.get("/api/invoices/my-invoices");
        this.invoices = res.data;
      } catch (err) {
        console.error("Error fetching invoices:", err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return "";
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    },
    printInvoice() {
      window.print();
    }
  }
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
  z-index: 2000;
}

.modal-content {
  background: #f8f9fa;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.modal-header {
  padding: 20px 30px;
  background: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1a1d2e;
}

.nav-icon {
  width: 22px;
  height: 22px;
  stroke: #2b59ff;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #888;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
}

/* List View */
.invoices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.invoice-row {
  background: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid #eee;
}

.invoice-row:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border-color: #2b59ff;
}

.invoice-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.inv-number {
  font-weight: 700;
  color: #1a1d2e;
}

.inv-date {
  font-size: 13px;
  color: #888;
}

.invoice-status {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.status-badge.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.inv-amount {
  font-weight: 800;
  color: #1a1d2e;
  font-size: 16px;
}

.chevron-icon {
  width: 18px;
  height: 18px;
  stroke: #ccc;
}

/* Detail View */
.invoice-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #2b59ff;
  font-weight: 700;
  cursor: pointer;
  width: fit-content;
}

.back-btn svg {
  width: 16px;
  height: 16px;
}

.invoice-paper {
  background: white;
  padding: 40px;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  border: 1px solid #eee;
}

.paper-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  border-bottom: 2px solid #f8f9fa;
  padding-bottom: 20px;
}

.company-info h3 {
  margin: 0 0 8px;
  color: #2b59ff;
  font-weight: 800;
}

.company-info p {
  margin: 0;
  font-size: 13px;
  color: #888;
}

.invoice-meta {
  text-align: right;
}

.invoice-meta h1 {
  margin: 0 0 10px;
  font-size: 28px;
  letter-spacing: 2px;
  color: #1a1d2e;
}

.invoice-meta p {
  margin: 4px 0;
  font-size: 14px;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.invoice-table th {
  background: #f8f9fa;
  padding: 12px 15px;
  text-align: left;
  font-size: 13px;
  text-transform: uppercase;
  color: #666;
}

.invoice-table td {
  padding: 15px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.text-right { text-align: right !important; }
.text-center { text-align: center !important; }

.invoice-table tfoot td {
  padding: 20px 15px;
  font-size: 18px;
}

.paper-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 40px;
}

.payment-details p {
  margin: 4px 0;
  font-size: 13px;
  color: #666;
}

.thank-you {
  font-style: italic;
  color: #888;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
}

.print-btn {
  background: #1a1d2e;
  color: white;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px;
}

.spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #2b59ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 50px;
}

.shop-now-btn {
  margin-top: 20px;
  background: #ff9a44;
  color: white;
  border: none;
  padding: 10px 30px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
}

@media print {
  .modal-overlay { background: white; position: absolute; }
  .modal-header, .close-btn, .back-btn, .action-buttons, .sidebar-brand { display: none !important; }
  .modal-content { width: 100%; max-width: 100%; box-shadow: none; border: none; height: auto; max-height: none; }
  .invoice-paper { box-shadow: none; border: none; padding: 0; }
}
</style>
