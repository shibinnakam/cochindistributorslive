<template>
  <div class="form-wrapper">
    <div class="form-card">
      <h2 class="form-title">Add New Products</h2>
      <form @submit.prevent="addProduct">
        <!-- Name -->
        <input
          id="name"
          v-model="name"
          type="text"
          placeholder="Item Name"
          required
        />

        <!-- Original Price -->
        <input
          id="originalPrice"
          v-model.number="originalPrice"
          type="number"
          placeholder="Rate"
          required
        />

        <!-- Discount Price -->
        <input
          id="discountPrice"
          v-model.number="discountPrice"
          type="number"
          placeholder="Discount Price"
          required
        />

        <!-- Quantity -->
        <input
          id="quantity"
          v-model.number="quantity"
          type="number"
          min="0"
          placeholder="Quantity"
          required
        />

        <!-- Description -->
        <textarea
          id="description"
          v-model="description"
          placeholder="Description"
          required
        ></textarea>

        <!-- ✅ Category Dropdown -->
        <label for="category">Select Category</label>
        <select v-model="category" id="category" required>
          <option value="" disabled>Select Category</option>
          <option v-for="c in categories" :key="c._id" :value="c._id">
            {{ c.name }}
          </option>
        </select>

        <!-- File Upload -->
        <input
          id="image"
          type="file"
          @change="handleImageUpload"
          accept="image/*"
          required
        />

        <!-- Image Preview -->
        <div v-if="preview" class="image-preview">
          <img :src="preview" alt="Preview" />
        </div>

        <!-- Submit -->
        <button type="submit" :disabled="loading">
          {{ loading ? "Adding..." : "Add Item" }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddProduct",
  data() {
    return {
      name: "",
      description: "",
      originalPrice: "",
      discountPrice: "",
      quantity: "", // ✅ added
      category: "", // ✅ selected category
      categories: [], // ✅ list of categories
      image: null,
      preview: null,
      loading: false,
    };
  },
  methods: {
    handleImageUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.image = file;
        this.preview = URL.createObjectURL(file);
      }
    },

    async loadCategories() {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        console.log("Categories API response:", res.data);

        if (Array.isArray(res.data)) {
          this.categories = res.data;
        } else if (Array.isArray(res.data.categories)) {
          this.categories = res.data.categories;
        } else {
          console.warn("⚠️ Unexpected categories API response:", res.data);
          this.categories = [];
        }
      } catch (err) {
        console.error("❌ Error loading categories:", err.message);
        this.categories = [];
      }
    },

    async addProduct() {
      if (!this.image) {
        alert("⚠️ Please select an image");
        return;
      }
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append("name", this.name);
        formData.append("description", this.description);
        formData.append("originalPrice", this.originalPrice);
        formData.append("discountPrice", this.discountPrice);
        formData.append("quantity", this.quantity); // ✅ send quantity
        formData.append("category", this.category);
        formData.append("image", this.image);

        await axios.post(
          "http://localhost:5000/api/products/addproduct",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        alert("✅ Product added successfully!");
        this.resetForm();
      } catch (err) {
        alert("❌ Error adding product");
        console.error("AddProduct error:", err.response?.data || err.message);
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.name = "";
      this.description = "";
      this.originalPrice = "";
      this.discountPrice = "";
      this.quantity = ""; // ✅ reset quantity
      this.category = "";
      this.image = null;
      this.preview = null;
    },
  },
  mounted() {
    this.loadCategories();
  },
};
</script>

<style scoped>
.form-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
}

.form-card {
  background: #fff;
  padding: 25px;
  width: 350px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 15px;
  font-size: 20px;
  font-weight: 600;
}

form input,
form textarea,
form select,
form button {
  width: 100%;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

form textarea {
  resize: none;
  height: 80px;
}

form button {
  background: #003366;
  color: #fff;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: 0.3s;
}

form button:hover {
  background: #002244;
}

.image-preview {
  text-align: center;
  margin: 10px 0;
}

.image-preview img {
  max-width: 100px;
  border-radius: 6px;
}
</style>
