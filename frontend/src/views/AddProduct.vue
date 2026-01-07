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

        <!-- Row 5: Category & Shape -->
        <div class="form-group">
          <label for="category">Category</label>
          <select v-model="category" id="category">
            <option value="" disabled>Select Category</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">
              {{ c.name }}
            </option>
          </select>
          <p v-if="errors.category" class="error">{{ errors.category }}</p>
        </div>
        <div class="form-group">
          <label for="shape">3D Shape</label>
          <select v-model="shape" id="shape">
            <option value="box">Box (Carton)</option>
            <option value="pillow">Pillow (Packet/Chips)</option>
            <option value="cylinder">Cylinder (Bottle/Can)</option>
            <option value="exact">Exact Shape (From Image)</option>
          </select>
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

        <!-- Row 7: 3-Image Upload for 3D Visualization -->
        <div class="form-group full-width">
          <label>Product Images for 3D View (Required)</label>
          <p class="form-hint">
            Upload front and back images for 3D packet visualization
          </p>
          <div class="image-upload-grid-2col">
            <!-- Front Image -->
            <div class="image-upload-item">
              <label for="imageFront" class="upload-label">Front Image</label>
              <input
                id="imageFront"
                type="file"
                @change="(e) => handleImageUpload(e, 'imageFront')"
                accept="image/jpeg,image/png"
              />
              <div v-if="previewFront" class="image-preview-small">
                <img :src="previewFront" alt="Front Preview" />
              </div>
              <p v-if="errors.imageFront" class="error">
                {{ errors.imageFront }}
              </p>
            </div>

            <!-- Back Image -->
            <div class="image-upload-item">
              <label for="imageBack" class="upload-label">Back Image</label>
              <input
                id="imageBack"
                type="file"
                @change="(e) => handleImageUpload(e, 'imageBack')"
                accept="image/jpeg,image/png"
              />
              <div v-if="previewBack" class="image-preview-small">
                <img :src="previewBack" alt="Back Preview" />
              </div>
              <p v-if="errors.imageBack" class="error">
                {{ errors.imageBack }}
              </p>
            </div>
          </div>
        </div>

        <!-- Side Image (Optional) -->
        <div v-if="shape !== 'pillow'" class="form-group full-width">
          <label>Side Image (Optional)</label>
          <p class="form-hint">Upload for better 3D visualization</p>
          <input
            id="imageSide"
            type="file"
            @change="(e) => handleImageUpload(e, 'imageSide')"
            accept="image/jpeg,image/png"
          />
          <div v-if="previewSide" class="image-preview-side">
            <img :src="previewSide" alt="Side Preview" />
          </div>
        </div>

        <!-- Top Image (Optional) -->
        <div v-if="shape !== 'pillow'" class="form-group full-width">
          <label>Top Image (Optional)</label>
          <p class="form-hint">Upload for even better 3D visualization</p>
          <input
            id="imageTop"
            type="file"
            @change="(e) => handleImageUpload(e, 'imageTop')"
            accept="image/jpeg,image/png"
          />
          <div v-if="previewTop" class="image-preview-side">
            <img :src="previewTop" alt="Top Preview" />
          </div>
        </div>

        <!-- Bottom Image (Optional) -->
        <div v-if="shape !== 'pillow'" class="form-group full-width">
          <label>Bottom Image (Optional)</label>
          <p class="form-hint">Upload for complete 3D visualization</p>
          <input
            id="imageBottom"
            type="file"
            @change="(e) => handleImageUpload(e, 'imageBottom')"
            accept="image/jpeg,image/png"
          />
          <div v-if="previewBottom" class="image-preview-side">
            <img :src="previewBottom" alt="Bottom Preview" />
          </div>
        </div>

        <!-- 3D Model Upload (Optional) -->
        <div class="form-group full-width">
          <label>3D Model (.glb, .gltf) - Optional</label>
          <input
            id="model3D"
            type="file"
            @change="handleModelUpload"
            accept=".glb,.gltf"
          />
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
      shape: "box",
      categories: [],
      imageFront: null,
      imageSide: null,
      imageBack: null,
      imageTop: null,
      imageBottom: null,
      previewFront: null,
      previewSide: null,
      previewBack: null,
      previewTop: null,
      previewBottom: null,
      model3D: null,
      loading: false,
      errors: {},
    };
  },
  methods: {
    handleImageUpload(e, imageType) {
      const file = e.target.files[0];
      if (file) {
        if (imageType === "imageFront") {
          this.imageFront = file;
          this.previewFront = URL.createObjectURL(file);
        } else if (imageType === "imageSide") {
          this.imageSide = file;
          this.previewSide = URL.createObjectURL(file);
        } else if (imageType === "imageBack") {
          this.imageBack = file;
          this.previewBack = URL.createObjectURL(file);
        } else if (imageType === "imageTop") {
          this.imageTop = file;
          this.previewTop = URL.createObjectURL(file);
        } else if (imageType === "imageBottom") {
          this.imageBottom = file;
          this.previewBottom = URL.createObjectURL(file);
        }
      }
    },

    handleModelUpload(e) {
      const file = e.target.files[0];
      if (file) {
        this.model3D = file;
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
      if (!this.imageFront) this.errors.imageFront = "Front image is required";
      if (!this.imageBack) this.errors.imageBack = "Back image is required";

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
        formData.append("shape", this.shape);
        formData.append("imageFront", this.imageFront);
        formData.append("imageSide", this.imageSide);
        formData.append("imageBack", this.imageBack);
        if (this.imageTop) {
          formData.append("imageTop", this.imageTop);
        }
        if (this.imageBottom) {
          formData.append("imageBottom", this.imageBottom);
        }
        if (this.model3D) {
          formData.append("model3D", this.model3D);
        }

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
      this.imageFront = null;
      this.imageSide = null;
      this.imageBack = null;
      this.imageTop = null;
      this.imageBottom = null;
      this.previewFront = null;
      this.previewSide = null;
      this.previewBack = null;
      this.previewTop = null;
      this.previewBottom = null;
      this.model3D = null;
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

.form-hint {
  font-size: 11px;
  color: #64748b;
  margin: 0 0 12px 0;
  font-style: italic;
}

.image-upload-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.image-upload-grid-2col {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 8px;
}

@media (max-width: 600px) {
  .image-upload-grid-2col {
    grid-template-columns: 1fr;
  }
}

.image-upload-item {
  display: flex;
  flex-direction: column;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 12px;
  background: #f8fafc;
}

.upload-label {
  font-size: 12px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 6px;
}

.image-upload-item input[type="file"] {
  padding: 4px 6px;
  font-size: 11px;
  border: 1px solid #cbd5e1 !important;
  margin-bottom: 8px;
}

.image-preview-small {
  width: 100%;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview-small img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-preview-side {
  width: 150px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  background: white;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}

.image-preview-side img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-upload-item .error {
  font-size: 10px;
  margin-top: 6px;
}
</style>
