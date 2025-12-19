<template>
  <div class="admin-wrapper">
    <!-- Sidebar -->
    <aside class="sidebar">
      <h2 class="sidebar-title">Master Admin</h2>
      <ul class="menu">
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'dashboard'"
            :class="{ active: selectedMenu === 'dashboard' }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span class="menu-text">Dashboard</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="showAddProductModal = true"
            :class="{ active: showAddProductModal }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14"></path>
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span class="menu-text">Add Products</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'addCategory'"
            :class="{ active: selectedMenu === 'addCategory' }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 5v14M5 12h14"></path>
              <rect x="3" y="3" width="18" height="18" rx="2"></rect>
            </svg>
            <span class="menu-text">Add Category</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'staffManagement'"
            :class="{ active: selectedMenu === 'staffManagement' }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span class="menu-text">Staff Management</span>
          </a>
        </li>
        <!-- Fixed Approve Leaves -->
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'approve-leaves'"
            :class="{ active: selectedMenu === 'approve-leaves' }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span class="menu-text">Approve Leaves</span>
          </a>
        </li>
        <li>
          <a href="#">
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
            <span class="menu-text">Page Management</span>
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="showListProductsModal = true"
            :class="{ active: showListProductsModal }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <line x1="9" y1="2" x2="9" y2="22"></line>
              <line x1="15" y1="2" x2="15" y2="22"></line>
              <line x1="3" y1="4" x2="21" y2="4"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
              <line x1="3" y1="16" x2="21" y2="16"></line>
            </svg>
            <span class="menu-text">List Products</span>
          </a>
        </li>
        <li class="message-item">
          <a
            href="#"
            @click.prevent="selectedMenu = 'chat'"
            :class="{ active: selectedMenu === 'chat' }"
          >
            <svg
              class="menu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              ></path>
            </svg>
            <span class="menu-text">Messages</span>
            <span v-if="unreadMessageCount > 0" class="message-badge">{{
              unreadMessageCount
            }}</span>
          </a>
        </li>
      </ul>
    </aside>

    <!-- Main -->
    <div class="main">
      <!-- Header -->
      <header v-if="!showEditProductModal" class="header">
        <h1>Dashboard <span class="small">Control panel</span></h1>

        <div class="admin-menu">
          <span>Laravel Admin ▾</span>
          <button class="logout-btn" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main
        class="content"
        :class="{
          'content-page': selectedMenu && selectedMenu !== 'dashboard',
        }"
      >
        <div v-if="selectedMenu === 'addCategory'" class="page-container">
          <ProductCategory />
        </div>
        <div v-if="selectedMenu === 'staffManagement'" class="page-container">
          <StaffManagement />
        </div>
        <div v-if="selectedMenu === 'approve-leaves'" class="page-container">
          <AdminLeaves />
        </div>

        <!-- Chat Component -->
        <div v-if="selectedMenu === 'chat'" class="page-container chat-page">
          <ChatWindow />
        </div>

        <!-- Dashboard Cards -->
        <template v-if="selectedMenu === 'dashboard' || !selectedMenu">
          <div v-if="dashboardLoading" class="loading-dashboard">
            <p>Loading dashboard statistics...</p>
          </div>
          <div v-else class="dashboard-container">
            <!-- Modern Hero Banner -->
            <div class="hero-banner">
              <div class="hero-content">
                <h2>Welcome to Dashboard</h2>
                <p>Manage your business operations efficiently</p>
              </div>
            </div>

            <!-- Modern Metrics Cards Row -->
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-icon products-icon">📦</div>
                <div class="metric-body">
                  <div class="metric-title">Total Products</div>
                  <div class="metric-number">{{ totalProducts }}</div>
                  <div class="metric-footer">
                    <span class="trend positive">↑ 12.5%</span>
                  </div>
                </div>
              </div>

              <div class="metric-card">
                <div class="metric-icon category-icon">🏷️</div>
                <div class="metric-body">
                  <div class="metric-title">Total Categories</div>
                  <div class="metric-number">{{ totalCategories }}</div>
                  <div class="metric-footer">
                    <span class="trend positive">↑ 8.2%</span>
                  </div>
                </div>
              </div>

              <div class="metric-card">
                <div class="metric-icon staff-icon">👥</div>
                <div class="metric-body">
                  <div class="metric-title">Total Staff</div>
                  <div class="metric-number">{{ totalStaff }}</div>
                  <div class="metric-footer">
                    <span class="trend positive">↑ 5.3%</span>
                  </div>
                </div>
              </div>

              <div class="metric-card">
                <div class="metric-icon inventory-icon">📊</div>
                <div class="metric-body">
                  <div class="metric-title">Total Inventory</div>
                  <div class="metric-number">{{ totalInventory }}</div>
                  <div class="metric-footer">
                    <span class="trend positive">↑ 15.1%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Dashboard Grid -->
            <div class="dashboard-grid">
              <!-- Left Column -->
              <div class="grid-section left-column">
                <div class="card-section modern">
                  <div class="card-header">
                    <h3>👷 Active Staff</h3>
                  </div>
                  <div class="section-content">
                    <p class="large-number">{{ activeStaff }}</p>
                    <div class="progress-wrapper">
                      <div class="progress-bar">
                        <div
                          class="progress-fill"
                          :style="{
                            width: (activeStaff / totalStaff) * 100 + '%',
                          }"
                        ></div>
                      </div>
                      <span class="progress-text"
                        >{{ Math.round((activeStaff / totalStaff) * 100) }}% of
                        total staff</span
                      >
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right Column -->
              <div class="grid-section right-column">
                <div class="card-section modern">
                  <div class="card-header">
                    <h3>📋 Leave Status</h3>
                  </div>
                  <div class="section-content">
                    <div class="leave-info">
                      <div class="leave-item modern">
                        <span class="leave-label">Pending Approvals</span>
                        <span class="leave-badge pending">{{
                          pendingLeaves
                        }}</span>
                      </div>
                      <div class="leave-item modern">
                        <span class="leave-label">Approved</span>
                        <span class="leave-badge approved">{{
                          approvedLeaves
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </main>
    </div>

    <!-- Add Product Modal -->
    <div
      v-if="showAddProductModal"
      class="modal-overlay"
      @click="showAddProductModal = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Add New Product</h2>
          <button class="modal-close" @click="showAddProductModal = false">
            ✕
          </button>
        </div>
        <AddProduct :is-modal="true" @close="closeAddProductModal" />
      </div>
    </div>

    <!-- List Products Modal -->
    <div
      v-if="showListProductsModal"
      class="modal-overlay-large"
      @click="showListProductsModal = false"
    >
      <div class="modal-content-large" @click.stop>
        <div class="modal-header">
          <h2>Product List</h2>
          <button class="modal-close" @click="showListProductsModal = false">
            ✕
          </button>
        </div>
        <ProductList
          :is-modal="true"
          @close="closeListProductsModal"
          @edit="openEditProductModal"
        />
      </div>
    </div>

    <!-- Edit Product Modal -->
    <div
      v-if="showEditProductModal"
      class="modal-overlay"
      @click="showEditProductModal = false"
    >
      <div class="modal-content-small" @click.stop>
        <div class="modal-header">
          <h2>Edit Product</h2>
          <button class="modal-close" @click="showEditProductModal = false">
            ✕
          </button>
        </div>
        <ProductEdit
          :product-id="editProductId"
          @updated="handleProductUpdated"
        />
      </div>
    </div>
  </div>
</template>
<script>
import axios from "axios";
import "@/assets/styles/AdminPage.css";
import AddProduct from "@/views/AddProduct.vue";
import ProductList from "@/views/ProductList.vue";
import ProductEdit from "@/views/ProductEdit.vue";
import ProductCategory from "@/views/AddCategory.vue";
import StaffManagement from "@/views/StaffManagement.vue";
import AdminLeaves from "@/views/AdminLeaves.vue";
import ChatWindow from "@/views/ChatWindow.vue";

const API_BASE_URL = "http://localhost:5000/api";

export default {
  name: "AdminPage",
  components: {
    AddProduct,
    ProductList,
    ProductEdit,
    ProductCategory,
    StaffManagement,
    AdminLeaves,
    ChatWindow,
  },
  data() {
    return {
      selectedMenu: "dashboard",
      dashboardLoading: false,
      showAddProductModal: false,
      showListProductsModal: false,
      showEditProductModal: false,
      editProductId: null,
      totalProducts: 0,
      totalCategories: 0,
      totalStaff: 0,
      activeStaff: 0,
      pendingLeaves: 0,
      approvedLeaves: 0,
      totalInventory: 0,
      unreadMessageCount: 0,
      messageInterval: null,
    };
  },
  mounted() {
    this.fetchDashboardStats();
    this.fetchUnreadMessages();
    this.messageInterval = setInterval(() => {
      this.fetchUnreadMessages();
    }, 3000);
  },
  beforeUnmount() {
    if (this.messageInterval) {
      clearInterval(this.messageInterval);
    }
  },
  methods: {
    async fetchDashboardStats() {
      this.dashboardLoading = true;
      try {
        const [productsRes, categoriesRes, staffRes, leavesRes] =
          await Promise.all([
            axios.get(`${API_BASE_URL}/products/getproduct`),
            axios.get(`${API_BASE_URL}/categories`),
            axios.get(`${API_BASE_URL}/staff`),
            axios.get(`${API_BASE_URL}/leaves/all`),
          ]);

        if (productsRes.data.success && productsRes.data.products) {
          this.totalProducts = productsRes.data.products.length;
          this.totalInventory = productsRes.data.products.reduce(
            (sum, product) => sum + (product.quantity || 0),
            0
          );
        }

        if (Array.isArray(categoriesRes.data)) {
          this.totalCategories = categoriesRes.data.length;
        }

        if (staffRes.data.success && Array.isArray(staffRes.data.staff)) {
          this.totalStaff = staffRes.data.staff.length;
          this.activeStaff = staffRes.data.staff.filter(
            (s) => s.status === "active"
          ).length;
        }

        if (Array.isArray(leavesRes.data)) {
          this.pendingLeaves = leavesRes.data.filter(
            (l) => l.status === "Pending"
          ).length;
          this.approvedLeaves = leavesRes.data.filter(
            (l) => l.status === "Approved"
          ).length;
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        this.dashboardLoading = false;
      }
    },
    closeAddProductModal() {
      this.showAddProductModal = false;
      this.fetchDashboardStats();
    },
    closeListProductsModal() {
      this.showListProductsModal = false;
      this.fetchDashboardStats();
    },
    openEditProductModal(productId) {
      this.editProductId = productId;
      this.showEditProductModal = true;
    },
    handleProductUpdated() {
      this.showEditProductModal = false;
      this.showListProductsModal = false;
      this.fetchDashboardStats();
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    async fetchUnreadMessages() {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          "http://localhost:5000/api/messages/unread-count",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (res.data.success) {
          this.unreadMessageCount = res.data.unreadCount;
        }
      } catch (err) {
        console.error("Error fetching unread messages:", err);
      }
    },
  },
};
</script>

<style scoped>
.menu a.active {
  font-weight: 600;
  color: #ffffff;
}

.message-item {
  position: relative;
}

.message-badge {
  position: absolute;
  top: 8px;
  right: 12px;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.3);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.admin-wrapper {
  background: #f8fafc;
}

.sidebar {
  scrollbar-width: thin;
  scrollbar-color: #475569 #e2e8f0;
}

.content {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: block;
  padding: 28px;
  overflow-y: auto;
}

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 24px;
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  min-height: 120px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-card h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-card p {
  margin: 0;
  font-size: 13px;
  opacity: 0.9;
  font-weight: 500;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.grid-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.card-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.card-section:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 12px;
}

.section-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.large-number {
  font-size: 42px;
  font-weight: 700;
  color: #2563eb;
  margin: 0;
  text-align: center;
}

.leave-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.leave-item {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 14px;
}

.stat-card.blue {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
}

.stat-card.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.stat-card.red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-card.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.content-page {
  display: flex !important;
  justify-content: center;
  align-items: flex-start;
}

.page-container {
  width: 100%;
  max-width: 1000px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.loading-dashboard {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  width: 100%;
}

.loading-dashboard p {
  font-size: 18px;
  color: #64748b;
  font-weight: 500;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-in-out;
}

.modal-content-small {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 75vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-in-out;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.2s;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  color: #1e293b;
}

.modal-content :deep(.form-wrapper) {
  padding: 0;
  min-height: 0;
  display: block;
}

.modal-content :deep(.form-card) {
  padding: 20px;
  width: 100%;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.modal-content :deep(.form-title) {
  display: none;
}

.modal-content-small :deep(.form-wrapper) {
  padding: 0;
  min-height: 0;
  display: block;
}

.modal-content-small :deep(.form-card) {
  padding: 20px;
  width: 100%;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}

.modal-content-small :deep(.form-title) {
  display: none;
}

.modal-overlay-large {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-in-out;
}

.modal-content-large {
  background: white;
  border-radius: 12px;
  max-width: 95%;
  width: 1200px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-in-out;
}

.modal-content-large :deep(.product-list-wrapper) {
  padding: 0;
}

.modal-content-large :deep(.products-row) {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  flex-wrap: wrap;
}

.modal-content-large :deep(.product-card) {
  min-width: auto;
  max-width: none;
}

@media (max-width: 1024px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: 1fr;
  }

  .stat-card {
    min-height: 100px;
  }

  .stat-card h2 {
    font-size: 24px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .card-section {
    padding: 16px;
  }

  .large-number {
    font-size: 36px;
  }
}
</style>
