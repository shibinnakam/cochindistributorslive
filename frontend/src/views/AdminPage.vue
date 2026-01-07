<template>
  <div class="admin-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-logo">🛍️</div>
        <div class="brand-text">ShopAdmin</div>
      </div>

      <nav class="nav-menu">
        <div class="nav-section">
          <span class="nav-section-title">Main</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'dashboard' }"
            @click.prevent="selectedMenu = 'dashboard'"
          >
            <span class="icon">📊</span>
            Dashboard
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Catalog</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'addProduct' }"
            @click.prevent="showAddProductModal = true"
          >
            <span class="icon">➕</span>
            Add Product
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'listProducts' }"
            @click.prevent="showListProductsModal = true"
          >
            <span class="icon">📦</span>
            Product List
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'addCategory' }"
            @click.prevent="selectedMenu = 'addCategory'"
          >
            <span class="icon">🏷️</span>
            Categories
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">People & Operations</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'staffManagement' }"
            @click.prevent="selectedMenu = 'staffManagement'"
          >
            <span class="icon">👥</span>
            Staff
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'orders' }"
            @click.prevent="selectedMenu = 'orders'"
          >
            <span class="icon">📦</span>
            Orders
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'approve-leaves' }"
            @click.prevent="selectedMenu = 'approve-leaves'"
          >
            <span class="icon">📅</span>
            Leaves
            <span v-if="pendingLeaves > 0" class="badge-pill">{{
              pendingLeaves
            }}</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'chat' }"
            @click.prevent="selectedMenu = 'chat'"
          >
            <span class="icon">💬</span>
            Messages
            <span v-if="unreadMessageCount > 0" class="badge-pill">{{
              unreadMessageCount
            }}</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Account</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'changePassword' }"
            @click.prevent="selectedMenu = 'changePassword'"
          >
            <span class="icon">🔑</span>
            Change Password
          </a>
          <a href="#" class="nav-item logout" @click.prevent="logout">
            <span class="icon">🚪</span>
            Logout
          </a>
        </div>
      </nav>
    </aside>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <h1 class="page-title">
            {{ getPageTitle(selectedMenu) }}
          </h1>
        </div>
        <div class="header-right">
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search..." />
          </div>
          <div class="user-profile">
            <div class="avatar">A</div>
            <div class="user-info">
              <span class="name">Administrator</span>
              <span class="role">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Content Views -->
      <div class="content-wrapper">
        <!-- Dashboard View -->
        <div v-if="selectedMenu === 'dashboard'" class="dashboard-view">
          <!-- Stats Cards -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon blue-bg">📦</div>
              <div class="stat-details">
                <span class="stat-value">{{ totalProducts }}</span>
                <span class="stat-label">Total Products</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon orange-bg">🏷️</div>
              <div class="stat-details">
                <span class="stat-value">{{ totalCategories }}</span>
                <span class="stat-label">Categories</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon green-bg">👥</div>
              <div class="stat-details">
                <span class="stat-value">{{ totalStaff }}</span>
                <span class="stat-label">Total Staff</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon purple-bg">⚡</div>
              <div class="stat-details">
                <span class="stat-value">{{ activeStaff }}</span>
                <span class="stat-label">Active Staff</span>
              </div>
            </div>
          </div>

          <!-- Secondary Stats Row -->
          <div class="stats-grid mt-4">
            <div class="stat-card">
              <div class="stat-icon red-bg">⏳</div>
              <div class="stat-details">
                <span class="stat-value">{{ pendingLeaves }}</span>
                <span class="stat-label">Pending Leaves</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon teal-bg">✅</div>
              <div class="stat-details">
                <span class="stat-value">{{ approvedLeaves }}</span>
                <span class="stat-label">Approved Leaves</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon pink-bg">📊</div>
              <div class="stat-details">
                <span class="stat-value">{{ totalInventory }}</span>
                <span class="stat-label">Total Inventory</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon indigo-bg">📧</div>
              <div class="stat-details">
                <span class="stat-value">{{ totalEnquiries || 0 }}</span>
                <span class="stat-label">Enquiries</span>
              </div>
            </div>
          </div>

          <!-- Recent Activity Section (Mockup for professional look) -->
          <div class="dashboard-sections">
            <div class="section-card recent-orders">
              <div class="section-header">
                <h3>Recent Activity</h3>
                <button class="btn-link">View All</button>
              </div>
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Activity</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>#1024</td>
                    <td>New Product Added</td>
                    <td><span class="status-badge success">Completed</span></td>
                    <td>Just now</td>
                  </tr>
                  <tr>
                    <td>#1023</td>
                    <td>Staff Leave Request</td>
                    <td><span class="status-badge warning">Pending</span></td>
                    <td>2 hours ago</td>
                  </tr>
                  <tr>
                    <td>#1022</td>
                    <td>Category Updated</td>
                    <td><span class="status-badge info">Updated</span></td>
                    <td>Yesterday</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Other Views -->
        <AddProduct v-if="selectedMenu === 'addProduct'" />
        <ProductCategory v-if="selectedMenu === 'addCategory'" />
        <ProductList v-if="selectedMenu === 'listProducts'" />
        <StaffManagement v-if="selectedMenu === 'staffManagement'" />
        <AdminOrders v-if="selectedMenu === 'orders'" />
        <AdminLeaves v-if="selectedMenu === 'approve-leaves'" />
        <ChatWindow v-if="selectedMenu === 'chat'" />

        <!-- Change Password View -->
        <div
          v-if="selectedMenu === 'changePassword'"
          class="password-section-wrapper"
        >
          <div class="section-card password-card">
            <div class="section-header">
              <h3>Update Your Password</h3>
            </div>

            <form @submit.prevent="handleChangePassword" class="password-form">
              <div v-if="passwordError" class="alert error">
                {{ passwordError }}
              </div>
              <div v-if="passwordSuccess" class="alert success">
                {{ passwordSuccess }}
              </div>

              <div class="form-group">
                <label>Current Password</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔒</span>
                  <input
                    type="password"
                    v-model="passwordForm.currentPassword"
                    required
                    placeholder="Enter current password"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>New Password</label>
                <div class="input-wrapper">
                  <span class="input-icon">🔑</span>
                  <input
                    type="password"
                    v-model="passwordForm.newPassword"
                    required
                    placeholder="Enter new password"
                  />
                </div>
                <small class="hint"
                  >At least 8 chars, uppercase, lowercase, number & special
                  char.</small
                >
              </div>

              <div class="form-group">
                <label>Confirm New Password</label>
                <div class="input-wrapper">
                  <span class="input-icon">✅</span>
                  <input
                    type="password"
                    v-model="passwordForm.confirmPassword"
                    required
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn-primary"
                  :disabled="passwordLoading"
                >
                  <span v-if="passwordLoading">Updating...</span>
                  <span v-else>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <div
      v-if="showAddProductModal"
      class="modal-backdrop"
      @click="showAddProductModal = false"
    >
      <div class="modal-panel" @click.stop>
        <div class="modal-header">
          <h3>Add New Product</h3>
          <button class="close-btn" @click="showAddProductModal = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <AddProduct :is-modal="true" @close="closeAddProductModal" />
        </div>
      </div>
    </div>

    <div
      v-if="showListProductsModal"
      class="modal-backdrop"
      @click="showListProductsModal = false"
    >
      <div class="modal-panel large" @click.stop>
        <div class="modal-header">
          <h3>Product Catalog</h3>
          <button class="close-btn" @click="showListProductsModal = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <ProductList
            :is-modal="true"
            @close="closeListProductsModal"
            @edit="openEditProductModal"
          />
        </div>
      </div>
    </div>

    <div
      v-if="showEditProductModal"
      class="modal-backdrop"
      @click="showEditProductModal = false"
    >
      <div class="modal-panel" @click.stop>
        <div class="modal-header">
          <h3>Edit Product</h3>
          <button class="close-btn" @click="showEditProductModal = false">
            ×
          </button>
        </div>
        <div class="modal-body">
          <ProductEdit
            :product-id="editProductId"
            @updated="handleProductUpdated"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/styles/AdminPage.css";
import axios from "axios";
import AddProduct from "@/views/AddProduct.vue";
import ProductList from "@/views/ProductList.vue";
import ProductEdit from "@/views/ProductEdit.vue";
import ProductCategory from "@/views/AddCategory.vue";
import StaffManagement from "@/views/StaffManagement.vue";
// eslint-disable-next-line no-unused-vars
import AdminOrders from "@/views/AdminOrders.vue";
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
    AdminOrders,
    AdminLeaves,
    ChatWindow,
  },
  data() {
    return {
      selectedMenu: "dashboard",
      showAddProductModal: false,
      showListProductsModal: false,
      showEditProductModal: false,
      editProductId: null,
      dashboardLoading: false,

      // Stats
      totalProducts: 0,
      totalCategories: 0,
      totalStaff: 0,
      activeStaff: 0,
      pendingLeaves: 0,
      approvedLeaves: 0,
      totalInventory: 0,
      unreadMessageCount: 0,
      totalEnquiries: 0,

      messageInterval: null,

      // Password Change
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      passwordError: "",
      passwordSuccess: "",
      passwordLoading: false,
    };
  },
  mounted() {
    this.fetchDashboardStats();
    this.fetchUnreadMessages();
    this.messageInterval = setInterval(() => {
      this.fetchUnreadMessages();
    }, 5000); // Reduced frequency
  },
  beforeUnmount() {
    if (this.messageInterval) clearInterval(this.messageInterval);
  },
  methods: {
    getPageTitle(menu) {
      const titles = {
        dashboard: "Dashboard Overview",
        addProduct: "Add New Product",
        listProducts: "Product Catalog",
        addCategory: "Category Management",
        staffManagement: "Staff Management",
        orders: "Order Management",
        "approve-leaves": "Leave Requests",
        chat: "Messages & Communications",
        changePassword: "Change Password",
      };
      return titles[menu] || "Dashboard";
    },
    async handleChangePassword() {
      this.passwordError = "";
      this.passwordSuccess = "";

      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        this.passwordError = "New passwords do not match.";
        return;
      }

      this.passwordLoading = true;

      try {
        const token = localStorage.getItem("token");
        const res = await axios.post(
          `${API_BASE_URL}/auth/change-password`,
          {
            currentPassword: this.passwordForm.currentPassword,
            newPassword: this.passwordForm.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        this.passwordSuccess = res.data.msg || "Password changed successfully.";
        this.passwordForm = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
      } catch (err) {
        this.passwordError =
          err.response?.data?.msg || "Failed to change password.";
      } finally {
        this.passwordLoading = false;
      }
    },
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
            (sum, p) => sum + (p.quantity || 0),
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
        console.error("Error loading stats:", error);
      } finally {
        this.dashboardLoading = false;
      }
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
        if (res.data.success) this.unreadMessageCount = res.data.unreadCount;
      } catch (e) {
        console.error("Msg Error", e);
      }
    },
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/");
    },
    closeAddProductModal() {
      this.showAddProductModal = false;
      this.fetchDashboardStats();
    },
    closeListProductsModal() {
      this.showListProductsModal = false;
      this.fetchDashboardStats();
    },
    openEditProductModal(id) {
      this.editProductId = id;
      this.showEditProductModal = true;
    },
    handleProductUpdated() {
      this.showEditProductModal = false;
      this.showListProductsModal = false;
      this.fetchDashboardStats();
    },
  },
};
</script>
