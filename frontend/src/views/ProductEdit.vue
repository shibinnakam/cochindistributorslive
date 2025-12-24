<template>
  <div class="form-wrapper">
    <div class="form-card">
      <h2 class="form-title">Edit Product</h2>
      <form
        @submit.prevent="updateProduct"
        enctype="multipart/form-data"
        class="form-grid"
      >
        <!-- Row 1: Name & Quantity -->
        <div class="form-group">
          <input v-model="form.name" type="text" placeholder="Item Name" />
        </div>
        <div class="form-group">
          <input
            v-model.number="form.quantity"
            type="number"
            min="0"
            placeholder="Quantity"
          />
        </div>

        <!-- Row 2: Original Price & Discount Price -->
        <div class="form-group">
          <input
            v-model.number="form.originalPrice"
            type="number"
            placeholder="Original Price"
          />
        </div>
        <div class="form-group">
          <input
            v-model.number="form.discountPrice"
            type="number"
            placeholder="Discount Price"
          />
        </div>

        <!-- Row 3: Description (Full Width) -->
        <div class="form-group full-width">
          <textarea
            v-model="form.description"
            placeholder="Description (4-20 chars)"
          ></textarea>
        </div>

        <!-- Row 4: Shape Selection -->
        <div class="form-group full-width">
          <label>3D Shape</label>
          <select v-model="form.shape">
            <option value="box">Box (Carton)</option>
            <option value="pillow">Pillow (Packet/Chips)</option>
            <option value="cylinder">Cylinder (Bottle/Can)</option>
          </select>
        </div>

        <!-- Row 5: File Upload -->
        <div class="form-group full-width">
          <label>Product Image</label>
          <input
            id="image"
            type="file"
            @change="handleFileUpload"
            accept="image/*"
          />
        </div>

        <!-- New Row: 3D Model Upload -->
        <div class="form-group full-width">
          <label>3D Model (.glb, .gltf) - Optional</label>
          <input
            id="model3D"
            type="file"
            @change="handleModelUpload"
            accept=".glb,.gltf"
          />
        </div>

        <!-- Current Image Preview -->
        <div v-if="form.image && !imageFile" class="image-preview-container">
          <img
            :src="getImageUrl(form.image)"
            alt="Current Product"
            class="image-preview"
          />
        </div>

        <!-- New Image Preview -->
        <div v-if="newImagePreview" class="image-preview-container">
          <img :src="newImagePreview" alt="New Preview" class="image-preview" />
        </div>

        <!-- Row 5: Submit Button (Full Width) -->
        <div class="form-group full-width button-group">
          <button type="submit" :disabled="loading" class="btn-submit">
            {{ loading ? "Updating..." : "Update Product" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductEdit",
  props: {
    productId: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      form: {
        name: "",
        description: "",
        originalPrice: null,
        discountPrice: null,
        quantity: null,
        image: "",
        model3D: "",
        shape: "box",
      },
      imageFile: null,
      model3DFile: null,
      newImagePreview: null,
      loading: false,
    };
  },
  async mounted() {
    await this.fetchProduct();
  },
  methods: {
    getImageUrl(path) {
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
    async fetchProduct() {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/getproduct/${this.productId}`
        );
        if (res.data.success) {
          const product = res.data.product;
          this.form = {
            name: product.name,
            description: product.description,
            originalPrice: product.originalPrice,
            discountPrice: product.discountPrice,
            quantity: product.quantity,
            image: product.image || "",
            model3D: product.model3D || "",
            shape: product.shape || "box",
          };
        }
      } catch (err) {
        console.error(
          "Error fetching product:",
          err.response?.data || err.message
        );
      }
    },
    handleFileUpload(e) {
      this.imageFile = e.target.files[0];
      if (this.imageFile) {
        const reader = new FileReader();
        reader.onload = (event) => {
          this.newImagePreview = event.target.result;
        };
        reader.readAsDataURL(this.imageFile);
      }
    },
    handleModelUpload(e) {
      this.model3DFile = e.target.files[0];
    },
    async updateProduct() {
      this.loading = true;
      try {
        const formData = new FormData();

        Object.keys(this.form).forEach((key) => {
          if (this.form[key] !== null && this.form[key] !== "") {
            if (key !== "image" && key !== "model3D") {
              formData.append(key, this.form[key]);
            }
          }
        });

        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        if (this.model3DFile) {
          formData.append("model3D", this.model3DFile);
        }

        const res = await axios.put(
          `http://localhost:5000/api/products/updateproduct/${this.productId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.success) {
          this.$emit("updated");
        }
      } catch (err) {
        console.error(err.response?.data || err.message);
      } finally {
        this.loading = false;
      }
    },
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

.button-group {
  margin-top: 8px;
}
</style>
