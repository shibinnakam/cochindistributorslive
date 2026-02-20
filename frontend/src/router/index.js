import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import About from "../views/About.vue";
import Contact from "../views/Contact.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";
import ProfilePage from "@/views/ProfilePage.vue";
import AddProduct from "@/views/AddProduct.vue";
import UserPage from "../views/UserPage.vue";
import AdminPage from "../views/AdminPage.vue";
import StaffRegister from "@/views/StaffRegister.vue";
import ProductEdit from "@/views/ProductEdit.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "LoginPage", component: Login },
  { path: "/about", name: "AboutPage", component: About },
  { path: "/contact", name: "ContactPage", component: Contact },
  { path: "/profile", name: "ProfilePage", component: ProfilePage },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },

  // Single password setup route
  {
    path: "/set-password/:token",
    name: "SetPassword",
    component: () => import("@/views/SetPassword.vue"),
  },

  { path: "/products/edit/:id", name: "ProductEdit", component: ProductEdit },
  {
    path: "/staff/staffregister",
    name: "StaffRegister",
    component: StaffRegister,
  },
  {
    path: "/google-success",
    name: "GoogleSuccess",
    component: () => import("@/views/GoogleSuccess.vue"),
  },

  // Admin routes
  {
    path: "/admin/add-category",
    name: "AddCategory",
    component: () => import("@/views/AddCategory.vue"),
  },
  {
    path: "/admin/add-product",
    name: "AddProduct",
    component: AddProduct,
  },
  {
    path: "/admin/products",
    name: "ProductList",
    component: () => import("@/views/ProductList.vue"),
  },
  {
    path: "/admin",
    name: "AdminPage",
    component: AdminPage,
  },
  // Admin staff management page
  {
    path: "/admin/staff-management",
    name: "AdminStaffManagement",
    component: () => import("@/views/StaffManagement.vue"),
  },
  // Admin leave management page
  {
    path: "/admin/leaves",
    name: "AdminLeaves",
    component: () => import("@/views/AdminLeaves.vue"),
  },
  // Admin live tracking page
  {
    path: "/admin/tracking",
    name: "LiveTracking",
    component: () => import("@/views/LiveTracking.vue"),
  },

  // User route
  {
    path: "/user",
    name: "UserPage",
    component: UserPage,
  },

  // Staff route
  {
    path: "/staff",
    name: "StaffPage",
    component: () => import("@/views/StaffPage.vue"),
  },
  // Staff leave request page
  {
    path: "/staff/leave",
    name: "StaffLeave",
    component: () => import("@/views/StaffLeave.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global beforeEach guard for all routes
router.beforeEach(async (to, from, next) => {
  const publicRoutes = [
    "Home",
    "LoginPage",
    "AboutPage",
    "ContactPage",
    "ForgotPassword",
    "ResetPassword",
    "SetPassword",
    "GoogleSuccess",
  ];

  if (publicRoutes.includes(to.name)) {
    next();
    return;
  }

  // For protected routes, check for token and user role in localStorage
  const token = localStorage.getItem("token");
  const userStr = localStorage.getItem("user");

  if (!token || !userStr) {
    next("/login");
    return;
  }

  try {
    const user = JSON.parse(userStr);

    // Check role-based access
    if (to.path.startsWith("/admin") && user.role !== "admin") {
      next("/login");
      return;
    }
    if (to.path === "/user" && user.role !== "user") {
      next("/login");
      return;
    }
    if (to.path.startsWith("/staff") && user.role !== "staff") {
      next("/login");
      return;
    }

    next();
  } catch (error) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    next("/login");
  }
});

export default router;
