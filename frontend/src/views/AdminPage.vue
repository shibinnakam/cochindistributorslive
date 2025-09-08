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
            Dashboard
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'addProduct'"
            :class="{ active: selectedMenu === 'addProduct' }"
          >
            Add Products
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'addCategory'"
            :class="{ active: selectedMenu === 'addCategory' }"
          >
            Add Category
          </a>
        </li>
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'staffManagement'"
            :class="{ active: selectedMenu === 'staffManagement' }"
          >
            Staff Management
          </a>
        </li>
        <!-- Fixed Approve Leaves -->
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'approve-leaves'"
            :class="{ active: selectedMenu === 'approve-leaves' }"
          >
            Approve Leaves
          </a>
        </li>
        <li><a href="#">Page Management</a></li>
        <li>
          <a
            href="#"
            @click.prevent="selectedMenu = 'listProducts'"
            :class="{ active: selectedMenu === 'listProducts' }"
          >
            List Products
          </a>
        </li>
        <li><a href="#">Slider Management</a></li>
        <li><a href="#">Team Management</a></li>
        <li><a href="#">Services Management</a></li>
        <li><a href="#">Portfolio Management</a></li>
        <li><a href="#">Enquiry Management</a></li>
      </ul>
    </aside>

    <!-- Main -->
    <div class="main">
      <!-- Header -->
      <header class="header">
        <h1>Dashboard <span class="small">Control panel</span></h1>

        <div class="admin-menu">
          <span>Laravel Admin ▾</span>
          <button class="logout-btn" @click="logout">
            <i class="bi bi-box-arrow-right"></i> Logout
          </button>
        </div>
      </header>

      <!-- Main Content -->
      <main class="content">
        <AddProduct v-if="selectedMenu === 'addProduct'" />
        <ProductCategory v-if="selectedMenu === 'addCategory'" />
        <ProductList v-if="selectedMenu === 'listProducts'" />
        <StaffManagement v-if="selectedMenu === 'staffManagement'" />
        <AdminLeaves v-if="selectedMenu === 'approve-leaves'" />

        <!-- Dashboard Cards -->
        <template v-if="selectedMenu === 'dashboard' || !selectedMenu">
          <div class="card blue">
            <h2>4</h2>
            <p>Total Static Page</p>
            <span class="info">More info →</span>
          </div>
          <div class="card orange">
            <h2>15</h2>
            <p>Total Slider</p>
            <span class="info">More info →</span>
          </div>
          <div class="card red">
            <h2>70</h2>
            <p>Total Team</p>
            <span class="info">More info →</span>
          </div>
          <div class="card green">
            <h2>20</h2>
            <p>Total Services</p>
            <span class="info">More info →</span>
          </div>
          <div class="card purple">
            <h2>30</h2>
            <p>Total Portfolio</p>
            <span class="info">More info →</span>
          </div>
          <div class="card pink">
            <h2>50</h2>
            <p>Total User</p>
            <span class="info">More info →</span>
          </div>
          <div class="card teal">
            <h2>65</h2>
            <p>Total Enquiries</p>
            <span class="info">More info →</span>
          </div>
        </template>
      </main>
    </div>
  </div>
</template>
<script>
import "@/assets/styles/AdminPage.css";
import AddProduct from "@/views/AddProduct.vue";
import ProductList from "@/views/ProductList.vue";
import ProductCategory from "@/views/AddCategory.vue";
import StaffManagement from "@/views/StaffManagement.vue";
import AdminLeaves from "@/views/AdminLeaves.vue";

export default {
  name: "AdminPage",
  components: {
    AddProduct,
    ProductList,
    ProductCategory,
    StaffManagement,
    AdminLeaves,
  },
  data() {
    return {
      selectedMenu: "dashboard", // default view
    };
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
.menu a.active {
  font-weight: 600;
  color: #ffffff;
}
</style>
