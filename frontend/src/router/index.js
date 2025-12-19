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
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") next();
      else next("/login");
    },
  },
  {
    path: "/admin/add-product",
    name: "AddProduct",
    component: AddProduct,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") next();
      else next("/login");
    },
  },
  {
    path: "/admin/products",
    name: "ProductList",
    component: () => import("@/views/ProductList.vue"),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") next();
      else next("/login");
    },
  },
  {
    path: "/admin",
    name: "AdminPage",
    component: AdminPage,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") next();
      else next("/login");
    },
  },
  // Admin staff management page
  {
    path: "/admin/staff-management",
    name: "AdminStaffManagement",
    component: () => import("@/views/StaffManagement.vue"),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") next();
      else next("/login");
    },
  },
  // Admin leave management page
  {
    path: "/admin/leaves",
    name: "AdminLeaves",
    component: () => import("@/views/AdminLeaves.vue"),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "admin") next();
      else next("/login");
    },
  },

  // User route
  {
    path: "/user",
    name: "UserPage",
    component: UserPage,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "user") next();
      else next("/login");
    },
  },

  // Staff route
  {
    path: "/staff",
    name: "StaffPage",
    component: () => import("@/views/StaffPage.vue"),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "staff") next();
      else next("/login");
    },
  },
  // Staff leave request page
  {
    path: "/staff/leave",
    name: "StaffLeave",
    component: () => import("@/views/StaffLeave.vue"),
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?.role === "staff") next();
      else next("/login");
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
