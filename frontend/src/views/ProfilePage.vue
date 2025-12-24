<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="profile-card">
      <button class="close-btn" @click="$emit('close')">✕</button>
      <h2>My Profile</h2>

      <div v-if="loading" class="loading">Loading...</div>
      <div v-else class="scrollable-content">
        <!-- Profile Form -->
        <form @submit.prevent="updateProfile" class="profile-form">
          <div class="form-group">
            <label>Email (Read-only)</label>
            <input
              type="email"
              v-model="user.email"
              disabled
              class="disabled-input"
            />
          </div>

          <div class="form-group">
            <label>Full Name</label>
            <input
              type="text"
              v-model="user.name"
              placeholder="Enter your name"
            />
          </div>

          <div class="form-group">
            <label>Contact Number</label>
            <input
              type="text"
              v-model="user.phone"
              placeholder="Phone number"
            />
          </div>

          <div class="form-group">
            <label>Shop Name</label>
            <input
              type="text"
              v-model="user.storeName"
              placeholder="Shop Name"
            />
          </div>

          <div class="form-group">
            <label>Shop Address</label>
            <textarea
              v-model="user.storeAddress"
              placeholder="Address"
            ></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Pincode</label>
              <input type="text" v-model="user.pincode" placeholder="Pincode" />
            </div>
            <div class="form-group">
              <label>Landmark</label>
              <input
                type="text"
                v-model="user.landmark"
                placeholder="Landmark"
              />
            </div>
          </div>

          <button type="submit" class="btn-primary" :disabled="updating">
            {{ updating ? "Saving..." : "Save Changes" }}
          </button>
        </form>

        <hr class="divider" />

        <!-- Password Section -->
        <div class="password-section">
          <h3>{{ user.hasPassword ? "Change Password" : "Set Password" }}</h3>

          <form @submit.prevent="changePassword">
            <div v-if="user.hasPassword" class="form-group">
              <label>Current Password</label>
              <input
                type="password"
                v-model="passwordForm.currentPassword"
                required
              />
            </div>

            <div class="form-group">
              <label>New Password</label>
              <input
                type="password"
                v-model="passwordForm.newPassword"
                required
              />
            </div>

            <div class="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                v-model="passwordForm.confirmPassword"
                required
              />
            </div>

            <button
              type="submit"
              class="btn-secondary"
              :disabled="passwordUpdating"
            >
              {{
                passwordUpdating
                  ? "Updating..."
                  : user.hasPassword
                  ? "Change Password"
                  : "Set Password"
              }}
            </button>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfilePage",
  emits: ["close"],
  data() {
    return {
      user: {
        email: "",
        name: "",
        phone: "",
        storeName: "",
        storeAddress: "",
        pincode: "",
        landmark: "",
        hasPassword: false,
      },
      passwordForm: {
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
      loading: true,
      updating: false,
      passwordUpdating: false,
    };
  },
  mounted() {
    this.fetchProfile();
  },
  methods: {
    async fetchProfile() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          this.$emit("close");
          this.$router.push("/login");
          return;
        }
        const res = await axios.get("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        this.user = res.data.user;
      } catch (err) {
        console.error("Error fetching profile:", err);
        alert("Failed to load profile");
      } finally {
        this.loading = false;
      }
    },
    async updateProfile() {
      this.updating = true;
      try {
        const token = localStorage.getItem("token");
        await axios.put("http://localhost:5000/api/auth/profile", this.user, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Profile updated successfully!");
      } catch (err) {
        console.error("Error updating profile:", err);
        alert("Failed to update profile");
      } finally {
        this.updating = false;
      }
    },
    async changePassword() {
      if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
        alert("New passwords do not match");
        return;
      }

      this.passwordUpdating = true;
      try {
        const token = localStorage.getItem("token");

        await axios.post(
          "http://localhost:5000/api/auth/change-password",
          {
            currentPassword: this.passwordForm.currentPassword,
            newPassword: this.passwordForm.newPassword,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        alert("Password updated successfully!");
        this.passwordForm = {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        };
        this.user.hasPassword = true;
      } catch (err) {
        console.error("Error changing password:", err);
        alert(err.response?.data?.msg || "Failed to update password");
      } finally {
        this.passwordUpdating = false;
      }
    },
  },
};
</script>

<style scoped>
.modal-overlay {
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

.profile-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.scrollable-content {
  overflow-y: auto;
  padding-right: 10px;
}

h2,
h3 {
  color: #2874f0;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
  min-height: 80px;
}

.disabled-input {
  background-color: #f9f9f9;
  color: #777;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #2874f0;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: 10px;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.divider {
  margin: 30px 0;
  border: 0;
  border-top: 1px solid #eee;
}

.btn-secondary {
  background-color: #fb641b;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: bold;
  width: 100%;
  margin-top: 10px;
}

.btn-secondary:hover {
  background-color: #e05c15;
}
</style>
