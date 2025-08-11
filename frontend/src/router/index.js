import { createRouter, createWebHistory } from "vue-router";

import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import About from "../views/About.vue";
import Contact from "../views/Contact.vue";
import ForgotPassword from "../views/ForgotPassword.vue";
import ResetPassword from "../views/ResetPassword.vue";

import UserPage from "../views/UserPage.vue";
import AdminPage from "../views/AdminPage.vue";

const routes = [
  { path: "/", name: "Home", component: Home },
  { path: "/login", name: "LoginPage", component: Login },
  { path: "/about", name: "AboutPage", component: About },
  { path: "/contact", name: "ContactPage", component: Contact },
  {
    path: "/forgot-password",
    name: "ForgotPassword",
    component: ForgotPassword,
  },
  { path: "/reset-password", name: "ResetPassword", component: ResetPassword },

  {
    path: "/user",
    name: "UserPage",
    component: UserPage,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "user") next();
      else next("/login");
    },
  },

  {
    path: "/admin",
    name: "AdminPage",
    component: AdminPage,
    beforeEnter: (to, from, next) => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.role === "admin") next();
      else next("/login");
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
