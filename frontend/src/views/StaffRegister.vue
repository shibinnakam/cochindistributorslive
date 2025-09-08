<template>
  <div class="staff-register">
    <h2>Complete Your Registration</h2>

    <!-- Form disabled if submitted -->
    <form
      v-if="!submitted"
      @submit.prevent="register"
      enctype="multipart/form-data"
    >
      <div class="form-grid">
        <!-- Left column -->
        <div>
          <label>Name *</label>
          <input v-model="name" placeholder="Enter your full name" />
          <p v-if="errors.name" class="field-error">{{ errors.name }}</p>

          <label>Address *</label>
          <textarea
            v-model="address"
            placeholder="Enter your address"
            rows="3"
          ></textarea>
          <p v-if="errors.address" class="field-error">{{ errors.address }}</p>

          <label>Phone *</label>
          <input v-model="phone" placeholder="Enter phone number" />
          <p v-if="errors.phone" class="field-error">{{ errors.phone }}</p>

          <label>Password *</label>
          <input
            type="password"
            v-model="password"
            placeholder="Enter password"
          />
          <p v-if="errors.password" class="field-error">
            {{ errors.password }}
          </p>
        </div>

        <!-- Right column -->
        <div>
          <label>Gender *</label>
          <select v-model="gender">
            <option disabled value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <p v-if="errors.gender" class="field-error">{{ errors.gender }}</p>

          <label>Pincode *</label>
          <input v-model="pincode" placeholder="Enter postal pincode" />
          <p v-if="errors.pincode" class="field-error">{{ errors.pincode }}</p>

          <label>Profile Photo *</label>
          <input type="file" @change="onFileChange" accept="image/*" />
          <p v-if="errors.profilePhoto" class="field-error">
            {{ errors.profilePhoto }}
          </p>

          <!-- Show preview -->
          <div v-if="profilePhotoPreview" class="preview">
            <img :src="profilePhotoPreview" alt="Profile Preview" />
          </div>
        </div>
      </div>

      <button type="submit">Submit</button>
    </form>

    <!-- Global message -->
    <p v-if="message" class="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      address: "",
      phone: "",
      password: "",
      gender: "",
      pincode: "",
      profilePhoto: null,
      profilePhotoPreview: null,
      message: "",
      submitted: false,
      errors: {},
    };
  },
  mounted() {
    this.checkTokenStatus();
  },
  methods: {
    onFileChange(e) {
      const file = e.target.files[0];
      if (file) {
        this.profilePhoto = file;
        this.profilePhotoPreview = URL.createObjectURL(file);
      }
    },

    async checkTokenStatus() {
      const token = this.$route.query.token;
      if (!token) {
        this.message = "Invalid or expired link";
        this.submitted = true;
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5000/api/staff/check-submitted",
          { token }
        );
        if (res.data.submitted) {
          this.message = "You have already submitted your registration.";
          this.submitted = true;
        }
      } catch {
        this.message = "Invalid or expired link.";
        this.submitted = true;
      }
    },

    async register() {
      this.errors = {};
      const token = this.$route.query.token;
      if (!token) {
        this.message = "Invalid or expired link";
        this.submitted = true;
        return;
      }

      // Frontend validations
      if (!this.name.match(/^[a-zA-Z ]{3,50}$/)) {
        this.errors.name = "Name must be 3–50 letters only";
      }
      if (
        !this.address ||
        this.address.length < 5 ||
        this.address.length > 100
      ) {
        this.errors.address = "Address must be 5–100 characters";
      }
      if (!this.phone.match(/^[6-9]\d{9}$/)) {
        this.errors.phone = "Invalid Indian phone number";
      }
      if (!this.pincode.match(/^[1-9]\d{5}$/)) {
        this.errors.pincode = "Invalid Indian pincode";
      }
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
      if (!this.password.match(passwordRegex)) {
        this.errors.password =
          "Password must be 8+ chars with uppercase, lowercase, number & special char";
      }
      if (!this.gender) {
        this.errors.gender = "Please select gender";
      }
      if (!this.profilePhoto) {
        this.errors.profilePhoto = "Profile photo is required";
      }

      if (Object.keys(this.errors).length > 0) return;

      try {
        const formData = new FormData();
        formData.append("token", token);
        formData.append("name", this.name);
        formData.append("address", this.address);
        formData.append("phone", this.phone);
        formData.append("password", this.password);
        formData.append("gender", this.gender);
        formData.append("pincode", this.pincode);
        formData.append("profilePhoto", this.profilePhoto);

        const res = await axios.post(
          "http://localhost:5000/api/staff/register",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        this.message = res.data.message || "Registration successful!";
        this.submitted = true;

        if (res.data.redirect) {
          setTimeout(() => {
            this.$router.push(res.data.redirect);
          }, 2000);
        }
      } catch (err) {
        if (err.response?.data?.alreadySubmitted) {
          this.message = "You have already submitted.";
          this.submitted = true;
        } else {
          this.message =
            err.response?.data?.message || "Error submitting registration";
        }
      }
    },
  },
};
</script>

<style scoped>
.staff-register {
  max-width: 800px;
  margin: 30px auto;
  padding: 30px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 25px;
  font-size: 24px;
  color: #2d3748;
}

.field-error {
  color: darkred;
  font-size: 13px;
  margin-top: -8px;
  margin-bottom: 10px;
}

.message {
  font-weight: bold;
  color: #4cafef;
  margin-bottom: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 40px;
  row-gap: 15px;
  text-align: left;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}

input,
select,
textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #ccc;
  outline: none;
  font-size: 14px;
  transition: border 0.3s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #4cafef;
}

button {
  margin-top: 15px;
  width: 100%;
  padding: 12px;
  background: #022f4aff;
  color: #fff;
  font-size: 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.3s;
}

button:hover {
  background: #0a4c78ff;
}

.preview img {
  margin-top: 10px;
  max-width: 100px;
  border-radius: 8px;
}
</style>
