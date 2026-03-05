<template>
  <div class="admin-container">
    <!-- Sidebar Navigation -->
    <aside class="sidebar" :class="{ 'mobile-open': isSidebarOpen, 'collapsed': !isSidebarOpen }">
      <div class="brand">
        <div class="brand-text">
          <span class="brand-first">Cochin</span>
          <span class="brand-second">Distributors</span>
        </div>
        <img :src="logo" alt="Logo" class="brand-logo-img" />
      </div>

      <div class="sidebar-user">
        <div class="avatar">A</div>
        <div class="user-info">
          <span class="name">Administrator</span>
          <span class="role">Super Admin <span class="status-dot"></span></span>
        </div>
      </div>

      <nav class="nav-menu">
        <div class="nav-section">
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'dashboard' }"
            @click.prevent="selectMenu('dashboard')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            </span>
            <span class="nav-text">Dashboard</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Catalog</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'addProduct' }"
            @click.prevent="openAddProductModal"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            </span>
            <span class="nav-text">Add Product</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'listProducts' }"
            @click.prevent="openListProductsModal"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            </span>
            <span class="nav-text">Product List</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'addCategory' }"
            @click.prevent="selectMenu('addCategory')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
            </span>
            <span class="nav-text">Categories</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Operations</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'staffManagement' }"
            @click.prevent="selectMenu('staffManagement')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span class="nav-text">Staff</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'orders' }"
            @click.prevent="selectMenu('orders')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            </span>
            <span class="nav-text">Orders</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'approve-leaves' }"
            @click.prevent="selectMenu('approve-leaves')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <span class="nav-text">Leaves</span>
            <span v-if="pendingLeaves > 0" class="badge-pill">{{
              pendingLeaves
            }}</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'chat' }"
            @click.prevent="selectMenu('chat')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </span>
            <span class="nav-text">Messages</span>
            <span v-if="unreadMessageCount > 0" class="badge-pill">{{
              unreadMessageCount
            }}</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'tracking' }"
            @click.prevent="selectMenu('tracking')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 13 8 13s8-7.75 8-13a8 8 0 0 0-8-8z"/></svg>
            </span>
            <span class="nav-text">Tracking</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'reviews' }"
            @click.prevent="selectMenu('reviews')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </span>
            <span class="nav-text">Reviews</span>
          </a>
        </div>

        <div class="nav-section">
          <span class="nav-section-title">Analysis</span>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'attendance' }"
            @click.prevent="selectMenu('attendance')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </span>
            <span class="nav-text">Attendance</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'attendance-analysis' }"
            @click.prevent="selectMenu('attendance-analysis')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </span>
            <span class="nav-text">Analysis</span>
          </a>
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'algorithm-comparison' }"
            @click.prevent="selectMenu('algorithm-comparison')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </span>
            <span class="nav-text">Algorithms</span>
          </a>
        </div>

        <div class="nav-section">
          <a
            href="#"
            class="nav-item"
            :class="{ active: selectedMenu === 'changePassword' }"
            @click.prevent="selectMenu('changePassword')"
          >
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </span>
            <span class="nav-text">Security</span>
          </a>
          <a href="#" class="nav-item logout" @click.prevent="logout">
            <span class="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            </span>
            <span class="nav-text">Logout</span>
          </a>
        </div>
      </nav>
    </aside>

    <div
      class="sidebar-overlay"
      :class="{ active: isSidebarOpen }"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Main Content Area -->
    <main class="main-content">
      <!-- Top Header -->
      <header class="top-header">
        <div class="header-left">
          <button
            class="sidebar-toggle"
            @click="isSidebarOpen = !isSidebarOpen"
          >
            ☰
          </button>
          <div class="search-bar">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Search projects" />
          </div>
        </div>
        <div class="header-right">
          <div class="header-actions">
            <button class="header-action-btn">🔔 <span class="dot"></span></button>
            <button class="header-action-btn">✉️ <span class="dot"></span></button>
          </div>
          <div class="user-profile">
            <div class="avatar">A</div>
            <span class="name">Administrator</span>
            <span class="dropdown-arrow">▼</span>
          </div>
        </div>
      </header>

      <!-- Content Views -->
      <div class="content-wrapper">
        <!-- Dashboard View -->
        <div v-if="selectedMenu === 'dashboard'" class="dashboard-view">
          <div class="dashboard-header">
            <div class="breadcrumb">🏠 Dashboard Overview</div>
          </div>

          <!-- Stats Cards (Main Row) -->
          <div class="stats-grid">
            <div class="stat-card gradient-danger">
              <div class="stat-label">
                <span>Total Revenue</span>
                <span class="stat-icon">💰</span>
              </div>
              <div class="stat-value">₹{{ totalPurchases.toLocaleString() }}</div>
              <div class="stat-subtext">Cumulative Sales</div>
            </div>
            <div class="stat-card gradient-info">
              <div class="stat-label">
                <span>Active Orders</span>
                <span class="stat-icon">🛒</span>
              </div>
              <div class="stat-value">{{ totalOrders || 0 }}</div>
              <div class="stat-subtext">Proccessing now</div>
            </div>
            <div class="stat-card gradient-success">
              <div class="stat-label">
                <span>Staff Present</span>
                <span class="stat-icon">👥</span>
              </div>
              <div class="stat-value">{{ activeStaff }} / {{ totalStaff }}</div>
              <div class="stat-subtext">Real-time attendance</div>
            </div>
          </div>

          <!-- Secondary Stats Row (New) -->
          <div class="stats-grid mt-4">
            <div class="stat-card mini white">
              <div class="stat-label">📦 Total Products</div>
              <div class="stat-value dark">{{ totalProducts }}</div>
            </div>
            <div class="stat-card mini white">
              <div class="stat-label">🏗️ Total Inventory</div>
              <div class="stat-value dark">{{ totalInventory }}</div>
            </div>
            <div class="stat-card mini white">
              <div class="stat-label">⏳ Pending Leaves</div>
              <div class="stat-value dark">{{ pendingLeaves }}</div>
            </div>
            <div class="stat-card mini white">
              <div class="stat-label">📧 Enquiries</div>
              <div class="stat-value dark">{{ totalEnquiries || 0 }}</div>
            </div>
          </div>

          <!-- Charts Grid -->
          <div class="charts-grid mt-4">
            <div class="section-card">
              <div class="section-header">
                <h3>Sales & Profit Analytics</h3>
                <div class="time-filter">
                  <select v-model="chartTimeframe" @change="initCharts" class="chart-select">
                    <option value="daily">Last 7 Days</option>
                    <option value="monthly">This Year</option>
                  </select>
                </div>
              </div>
              <div style="height: 350px">
                <canvas ref="salesChart"></canvas>
              </div>
            </div>
            <div class="section-card">
              <div class="section-header">
                <h3>System Distribution</h3>
              </div>
              <div style="height: 350px">
                <canvas ref="trafficChart"></canvas>
              </div>
            </div>
          </div>

          <!-- Recent Activity Section -->
          <div class="dashboard-sections">
            <div class="section-card recent-orders">
              <div class="section-header">
                <h3>Recent Activity</h3>
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
                    <td><span class="status-badge success">DONE</span></td>
                    <td>Just now</td>
                  </tr>
                  <tr>
                    <td>#1023</td>
                    <td>Staff Leave Request</td>
                    <td><span class="status-badge warning">PROGRESS</span></td>
                    <td>2 hours ago</td>
                  </tr>
                  <tr>
                    <td>#1022</td>
                    <td>Category Updated</td>
                    <td><span class="status-badge info">INFO</span></td>
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
        <LiveTracking v-if="selectedMenu === 'tracking'" />
        <AdminAttendance v-if="selectedMenu === 'attendance'" />
        <AttendanceAnalysis v-if="selectedMenu === 'attendance-analysis'" />
        <AlgorithmComparison v-if="selectedMenu === 'algorithm-comparison'" />

        <!-- Reviews View -->
        <div v-if="selectedMenu === 'reviews'" class="reviews-section">
          <div class="section-card">
            <div class="section-header">
              <h3>User Reviews Management</h3>
              <div class="review-tabs">
                <button class="tab-btn active">All Reviews</button>
              </div>
            </div>

            <div class="reviews-list">
              <div v-if="reviewsLoading" class="loading">
                Loading reviews...
              </div>
              <div v-else-if="currentReviews.length === 0" class="no-reviews">
                No reviews found.
              </div>
              <div v-else class="reviews-grid">
                <div
                  v-for="review in currentReviews"
                  :key="review._id"
                  class="review-card"
                >
                  <div class="review-header">
                    <div class="user-info">
                      <div class="avatar">
                        {{ review.user.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="user-details">
                        <span class="user-name">{{ review.user.name }}</span>
                        <span class="user-email">{{ review.user.email }}</span>
                      </div>
                    </div>
                    <div class="review-rating">
                      <div class="stars">
                        <span
                          v-for="star in 5"
                          :key="star"
                          :class="{ filled: star <= review.rating }"
                          class="star"
                        >
                          ★
                        </span>
                      </div>
                      <span class="rating-text">{{ review.rating }}/5</span>
                    </div>
                  </div>

                  <div class="review-product">
                    <div class="product-info">
                      <img
                        v-if="review.product.imageFront"
                        :src="`/${review.product.imageFront}`"
                        alt="Product Image"
                        class="product-image"
                      />
                      <div class="product-details">
                        <span class="product-label">Product:</span>
                        <span class="product-name">{{
                          review.product.name
                        }}</span>
                        <span class="product-id"
                          >ID: {{ review.product._id }}</span
                        >
                      </div>
                    </div>
                  </div>

                  <div class="review-comment">
                    <p>{{ review.comment }}</p>
                  </div>

                  <div class="review-footer">
                    <span class="review-date">
                      {{ formatDate(review.createdAt) }}
                    </span>
                    <div class="review-actions">
                      <button
                        @click="deleteReview(review._id)"
                        class="btn-delete"
                        :disabled="actionLoading"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
import logo from "@/assets/logo.jpeg";
import axios from "@/utils/axios";
import socket from "@/socket";
import Chart from "chart.js/auto";
import AddProduct from "@/views/AddProduct.vue";
import ProductList from "@/views/ProductList.vue";
import ProductEdit from "@/views/ProductEdit.vue";
import ProductCategory from "@/views/AddCategory.vue";
import StaffManagement from "@/views/StaffManagement.vue";
// eslint-disable-next-line no-unused-vars
import AdminOrders from "@/views/AdminOrders.vue";
import AdminLeaves from "@/views/AdminLeaves.vue";
import ChatWindow from "@/views/ChatWindow.vue";
import LiveTracking from "@/views/LiveTracking.vue";
import AdminAttendance from "@/views/AdminAttendance.vue";
import AttendanceAnalysis from "@/views/AttendanceAnalysis.vue";
import AlgorithmComparison from "@/views/AlgorithmComparison.vue";

const API_BASE_URL = "/api";

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
    LiveTracking,
    AdminAttendance,
    AttendanceAnalysis,
    AlgorithmComparison,
  },
  data() {
    return {
      selectedMenu: "dashboard",
      isSidebarOpen: true,
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
      pendingReviews: 0,
      totalPurchases: 0,
      totalProfit: 0,
      totalOrders: 0,
      salesTimeframe: "all",
      analyticsData: null,
      chartTimeframe: "daily", // New: for chart filtering
      displayedPurchases: 0,
      displayedProfit: 0,
      reviewsLoading: false,
      currentReviews: [],
      actionLoading: false,

      messageInterval: null,

      // Charts
      salesChart: null,
      trafficChart: null,

      // Password Change
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      passwordError: "",
      passwordSuccess: "",
      passwordLoading: false,
      logo,
    };
  },
  mounted() {
    // Initialize sidebar state based on screen width
    if (window.innerWidth <= 1024) {
      this.isSidebarOpen = false;
    }
    this.fetchDashboardStats();
    this.fetchUnreadMessages();
    this.messageInterval = setInterval(() => {
      this.fetchUnreadMessages();
    }, 10000);

    // Socket listeners for real-time updates
    socket.on("productAdded", () => {
      this.fetchDashboardStats();
    });

    socket.on("productUpdated", () => {
      this.fetchDashboardStats();
    });

    socket.on("productDeleted", () => {
      this.fetchDashboardStats();
    });

    socket.on("categoryAdded", () => {
      this.fetchDashboardStats();
    });

    socket.on("categoryUpdated", () => {
      this.fetchDashboardStats();
    });

    socket.on("categoryDeleted", () => {
      this.fetchDashboardStats();
    });

    socket.on("orderPlaced", () => {
      this.fetchDashboardStats();
    });
  },
  beforeUnmount() {
    if (this.messageInterval) clearInterval(this.messageInterval);

    // Destroy charts
    if (this.salesChart) this.salesChart.destroy();
    if (this.trafficChart) this.trafficChart.destroy();

    // Remove socket listeners
    socket.off("productAdded");
    socket.off("productUpdated");
    socket.off("productDeleted");
    socket.off("categoryAdded");
    socket.off("categoryUpdated");
    socket.off("categoryDeleted");
    socket.off("orderPlaced");
  },
  watch: {
    selectedMenu(newVal) {
      if (newVal === "reviews") {
        this.fetchReviews();
      }
      if (newVal === "dashboard") {
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    },
    totalPurchases() {
      if (this.selectedMenu === "dashboard") {
        this.initCharts();
      }
    },
  },
  methods: {
    initCharts() {
      if (!this.$refs.salesChart || !this.$refs.trafficChart) return;

      const salesCtx = this.$refs.salesChart.getContext("2d");
      if (this.salesChart) this.salesChart.destroy();

      // Extract data from analyticsData
      let labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      let salesData = [0, 0, 0, 0, 0, 0, 0];
      let profitData = [0, 0, 0, 0, 0, 0, 0];

      if (this.analyticsData && this.analyticsData[this.chartTimeframe]) {
        const dataSet = this.analyticsData[this.chartTimeframe];
        const purchases = dataSet.purchases || {};
        const profits = dataSet.profit || {};
        
        // Get last 7 entries for labels/data
        const keys = Object.keys(purchases).sort().slice(-7);
        if (keys.length > 0) {
          labels = keys.map(k => k.split('-').slice(-1)[0]); // Shorten date
          salesData = keys.map(k => purchases[k] || 0);
          profitData = keys.map(k => profits[k] || 0);
        }
      }

      this.salesChart = new Chart(salesCtx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Sales (₹)",
              data: salesData,
              backgroundColor: "rgba(182, 137, 255, 0.8)",
              borderRadius: 8,
              borderWidth: 0,
              barThickness: 20
            },
            {
              label: "Profit (₹)",
              data: profitData,
              backgroundColor: "rgba(132, 217, 210, 0.8)",
              borderRadius: 8,
              borderWidth: 0,
              barThickness: 20
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { 
              position: "top", 
              align: "end", 
              labels: { 
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 20,
                font: { family: 'Inter', size: 12, weight: '600' }
              } 
            },
          },
          scales: {
            y: { 
              beginAtZero: true, 
              grid: { color: "#f3f4f6", drawBorder: false },
              ticks: { font: { size: 11 } }
            },
            x: { 
              grid: { display: false },
              ticks: { font: { size: 11 } }
            },
          },
        },
      });

      // System Distribution (Pie/Doughnut)
      const trafficCtx = this.$refs.trafficChart.getContext("2d");
      if (this.trafficChart) this.trafficChart.destroy();

      // Use inventory and staff ratios for distribution mock if real data is missing
      const inventoryRatio = Math.min(this.totalInventory / 1000, 1) * 100;
      const staffRatio = (this.activeStaff / (this.totalStaff || 1)) * 100;

      this.trafficChart = new Chart(trafficCtx, {
        type: "doughnut",
        data: {
          labels: ["Inventory", "Active Staff", "Pending"],
          datasets: [
            {
              data: [inventoryRatio, staffRatio, 100 - staffRatio],
              backgroundColor: ["#fe7c96", "#1bcfb4", "#25aaff"],
              hoverOffset: 10,
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "75%",
          plugins: {
            legend: { 
              position: "bottom", 
              labels: { 
                usePointStyle: true,
                pointStyle: 'circle',
                padding: 30,
                font: { family: 'Inter', size: 12, weight: '500' }
              } 
            },
          },
        },
      });
    },
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
        tracking: "Live Vehicle Tracking",
        attendance: "Staff Attendance Monitoring",
        "attendance-analysis": "Attendance Analysis & Trends",
        "algorithm-comparison": "ML Algorithm Comparative Analysis",
      };
      return titles[menu] || "Dashboard";
    },
    selectMenu(menu) {
      this.selectedMenu = menu;
      this.isSidebarOpen = false;
    },
    openAddProductModal() {
      this.showAddProductModal = true;
      this.isSidebarOpen = false;
    },
    openListProductsModal() {
      this.showListProductsModal = true;
      this.isSidebarOpen = false;
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
        const res = await axios.post(`${API_BASE_URL}/auth/change-password`, {
          currentPassword: this.passwordForm.currentPassword,
          newPassword: this.passwordForm.newPassword,
        });

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
        const [
          productsRes,
          categoriesRes,
          staffRes,
          leavesRes,
          reviewsRes,
          salesRes,
        ] = await Promise.all([
          axios.get(`${API_BASE_URL}/products/getproduct`),
          axios.get(`${API_BASE_URL}/categories`),
          axios.get(`${API_BASE_URL}/staff`),
          axios.get(`${API_BASE_URL}/leaves/all`),
          axios.get(`${API_BASE_URL}/reviews/admin/pending`),
          axios.get(`${API_BASE_URL}/orders/admin/sales-analytics`),
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

        if (Array.isArray(reviewsRes.data)) {
          this.pendingReviews = reviewsRes.data.length;
        }

        if (salesRes.data) {
          this.analyticsData = salesRes.data;
          this.totalPurchases = salesRes.data.totalPurchases || 0;
          this.totalProfit = salesRes.data.totalProfit || 0;
          this.totalOrders = salesRes.data.totalOrders || 0;
        }
        
        this.$nextTick(() => {
          this.initCharts();
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        this.dashboardLoading = false;
      }
    },
    async fetchUnreadMessages() {
      try {
        const res = await axios.get("/api/messages/unread-count");
        if (res.data.success) this.unreadMessageCount = res.data.unreadCount;
      } catch (e) {
        console.error("Msg Error", e);
      }
    },
    async logout() {
      try {
        await axios.post("/api/auth/logout");
      } catch (err) {
        console.error("Logout error:", err);
      } finally {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        this.$router.push("/");
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
    openEditProductModal(id) {
      this.editProductId = id;
      this.showEditProductModal = true;
    },
    handleProductUpdated() {
      this.showEditProductModal = false;
      this.showListProductsModal = false;
      this.fetchDashboardStats();
    },
    async fetchReviews() {
      this.reviewsLoading = true;
      try {
        const res = await axios.get("/api/reviews/admin/all");
        if (res.data.success) {
          this.currentReviews = res.data.reviews;
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        this.reviewsLoading = false;
      }
    },
    async deleteReview(id) {
      if (!confirm("Are you sure you want to delete this review?")) return;
      this.actionLoading = true;
      try {
        const res = await axios.delete(`/api/reviews/admin/delete/${id}`);
        if (res.data.success) {
          this.fetchReviews();
          this.fetchDashboardStats();
        }
      } catch (err) {
        console.error("Error deleting review:", err);
        alert("Failed to delete review");
      } finally {
        this.actionLoading = false;
      }
    },
    getImageUrl(path) {
      if (!path) return "/placeholder.jpg";
      return path.startsWith("/") ? path : `/${path}`;
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
