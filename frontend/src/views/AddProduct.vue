<template>
  <div class="form-wrapper">
    <div class="form-card">
      <h2 class="form-title">Add New Products</h2>
      <form @submit.prevent="addProduct" class="form-grid">
        <!-- Row 1: Name & Quantity -->
        <div class="form-group">
          <input id="name" v-model="name" type="text" placeholder="Item Name" />
          <p v-if="errors.name" class="error">{{ errors.name }}</p>
        </div>
        <div class="form-group">
          <input
            id="quantity"
            v-model.number="quantity"
            type="number"
            min="0"
            placeholder="Quantity"
          />
          <p v-if="errors.quantity" class="error">{{ errors.quantity }}</p>
        </div>

        <!-- Row 2: Original Price & Discount Price -->
        <div class="form-group">
          <input
            id="originalPrice"
            v-model.number="originalPrice"
            type="number"
            placeholder="Original Price"
          />
          <p v-if="errors.originalPrice" class="error">
            {{ errors.originalPrice }}
          </p>
        </div>
        <div class="form-group">
          <input
            id="discountPrice"
            v-model.number="discountPrice"
            type="number"
            placeholder="Discount Price"
          />
          <p v-if="errors.discountPrice" class="error">
            {{ errors.discountPrice }}
          </p>
        </div>

        <!-- Row 3: Manufacturing Date & Expiry Date -->
        <div class="form-group">
          <label for="manufacturingDate">Mfg Date</label>
          <input
            id="manufacturingDate"
            v-model="manufacturingDate"
            type="date"
          />
          <p v-if="errors.manufacturingDate" class="error">
            {{ errors.manufacturingDate }}
          </p>
        </div>
        <div class="form-group">
          <label for="expiryDate">Expiry Date</label>
          <input id="expiryDate" v-model="expiryDate" type="date" />
          <p v-if="errors.expiryDate" class="error">{{ errors.expiryDate }}</p>
        </div>

        <!-- Row 4: Batch Number & Rack Number -->
        <div class="form-group">
          <input
            id="batchNumber"
            v-model="batchNumber"
            type="text"
            placeholder="Batch Number"
          />
          <p v-if="errors.batchNumber" class="error">
            {{ errors.batchNumber }}
          </p>
        </div>
        <div class="form-group">
          <input
            id="rackNumber"
            v-model.number="rackNumber"
            type="number"
            min="1"
            max="155"
            placeholder="Rack (1-155)"
          />
          <p v-if="errors.rackNumber" class="error">{{ errors.rackNumber }}</p>
        </div>

        <!-- Row 5: Category (Full Width) -->
        <div class="form-group full-width">
          <label for="category">Category</label>
          <select v-model="category" id="category">
            <option value="" disabled>Select Category</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">
              {{ c.name }}
            </option>
          </select>
          <p v-if="errors.category" class="error">{{ errors.category }}</p>
        </div>

        <!-- Row 6: Description (Full Width) -->
        <div class="form-group full-width">
          <textarea
            id="description"
            v-model="description"
            placeholder="Description (4-20 chars)"
          ></textarea>
          <p v-if="errors.description" class="error">
            {{ errors.description }}
          </p>
        </div>

        <!-- Row 7: File Upload & Preview -->
        <div class="form-group full-width">
          <input
            id="image"
            type="file"
            @change="handleImageUpload"
            accept="image/*"
          />
          <p v-if="errors.image" class="error">{{ errors.image }}</p>
        </div>

        <!-- Image Preview -->
        <div v-if="preview" class="image-preview-container">
          <img :src="preview" alt="Preview" class="image-preview" />
        </div>

        <!-- Row 8: Submit Button (Full Width) -->
        <div class="form-group full-width button-group">
          <button type="submit" :disabled="loading" class="btn-submit">
            {{ loading ? "Adding..." : "Add Product" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddProduct",
  props: {
    isModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      name: "",
      description: "",
      originalPrice: "",
      discountPrice: "",
      quantity: "",
      manufacturingDate: "",
      expiryDate: "",
      batchNumber: "",
      rackNumber: "",
      category: "",
      categories: [],
      image: null,
      preview: null,
      loading: false,
      errors: {},
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
        this.categories = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.categories)
          ? res.data.categories
          : [];
      } catch (err) {
        console.error("❌ Error loading categories:", err.message);
        this.categories = [];
      }
    },

    validateBatchNumber(batch) {
      const patterns = [
        /^[A-Z0-9]{3,10}$/,
        /^\d{3,8}$/,
        /^[A-Z]{1,2}\d{2,6}$/,
        /^\d{2}[A-Z]{1,2}\d{2,4}$/,
        /^[A-Z0-9-/]{3,12}$/,
      ];
      return patterns.some((regex) => regex.test(batch));
    },

    async addProduct() {
      this.errors = {}; // reset errors

      // ✅ Frontend validation
      if (!this.name || !/^[A-Za-z0-9 ]{4,15}$/.test(this.name))
        this.errors.name =
          "Product name 4-15 chars, letters/numbers/spaces only";
      if (!this.description || !/^[A-Za-z0-9 ]{4,20}$/.test(this.description))
        this.errors.description =
          "Description 4-20 chars, letters/numbers/spaces only";
      if (
        !this.originalPrice ||
        this.originalPrice < 1 ||
        this.originalPrice > 1000
      )
        this.errors.originalPrice = "Original price must be 1-1000";
      if (
        !this.discountPrice ||
        this.discountPrice < 1 ||
        this.discountPrice > 1000
      )
        this.errors.discountPrice = "Discount price must be 1-1000";
      if (this.discountPrice > this.originalPrice)
        this.errors.discountPrice =
          "Discount cannot be greater than original price";
      if (this.quantity < 0)
        this.errors.quantity = "Quantity must be 0 or greater";
      if (!this.manufacturingDate)
        this.errors.manufacturingDate = "Manufacturing date required";
      if (!this.expiryDate) this.errors.expiryDate = "Expiry date required";

      if (this.manufacturingDate && this.expiryDate) {
        const mfgDate = new Date(this.manufacturingDate);
        const expDate = new Date(this.expiryDate);
        if (mfgDate.getTime() === expDate.getTime())
          this.errors.expiryDate = "Expiry must differ from manufacturing date";
        if ((expDate - mfgDate) / (1000 * 60 * 60 * 24) < 10)
          this.errors.expiryDate =
            "Expiry must be at least 10 days after manufacturing";
      }

      if (!this.batchNumber || !this.validateBatchNumber(this.batchNumber))
        this.errors.batchNumber = "Invalid batch number format";
      if (!this.rackNumber || this.rackNumber < 1 || this.rackNumber > 155)
        this.errors.rackNumber = "Rack number must be 1-155";
      if (!this.category) this.errors.category = "Select a category";
      if (!this.image) this.errors.image = "Select an image";

      // Stop if there are validation errors
      if (Object.keys(this.errors).length > 0) return;

      // ✅ Submit form
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append("name", this.name);
        formData.append("description", this.description);
        formData.append("originalPrice", this.originalPrice);
        formData.append("discountPrice", this.discountPrice);
        formData.append("quantity", this.quantity);
        formData.append("manufacturingDate", this.manufacturingDate);
        formData.append("expiryDate", this.expiryDate);
        formData.append("batchNumber", this.batchNumber);
        formData.append("rackNumber", this.rackNumber);
        formData.append("category", this.category);
        formData.append("image", this.image);

        const res = await axios.post(
          "http://localhost:5000/api/products/addproduct",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (this.isModal) {
          this.$emit("close");
        } else {
          alert(res.data.message);
          this.resetForm();
        }
      } catch (err) {
        const backendMessage = err.response?.data?.message;
        if (backendMessage) {
          if (backendMessage.includes("name"))
            this.errors.name = backendMessage;
          else if (backendMessage.includes("description"))
            this.errors.description = backendMessage;
          else if (backendMessage.includes("Batch"))
            this.errors.batchNumber = backendMessage;
          else if (backendMessage.includes("category"))
            this.errors.category = backendMessage;
          else alert(backendMessage);
        } else {
          alert("Server error");
        }
      } finally {
        this.loading = false;
      }
    },

    resetForm() {
      this.name = "";
      this.description = "";
      this.originalPrice = "";
      this.discountPrice = "";
      this.quantity = "";
      this.manufacturingDate = "";
      this.expiryDate = "";
      this.batchNumber = "";
      this.rackNumber = "";
      this.category = "";
      this.image = null;
      this.preview = null;
      this.errors = {};
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
  padding: 20px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.form-title {
  text-align: center;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 12px;
  font-weight: 500;
  color: #475569;
  margin-bottom: 4px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group textarea {
  resize: none;
  height: 70px;
  min-height: 70px;
}

.btn-submit {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: white;
  font-weight: 600;
  border: none;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  width: 100%;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.image-preview-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 8px 0;
}

.image-preview {
  max-width: 120px;
  max-height: 120px;
  border-radius: 8px;
  border: 2px solid #e2e8f0;
  object-fit: contain;
}

.error {
  color: #ef4444;
  font-size: 11px;
  margin-top: 2px;
  margin-bottom: 0;
}

.button-group {
  margin-top: 4px;
}
</style>
