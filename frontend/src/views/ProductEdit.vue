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
          <label>Item Name</label>
          <input v-model="form.name" type="text" placeholder="Item Name" />
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input
            v-model.number="form.quantity"
            type="number"
            min="0"
            placeholder="Quantity"
          />
        </div>

        <!-- Row 2: Original Price & Discount Price & Cost Price -->
        <div class="form-group">
          <label>Original Price</label>
          <input
            v-model.number="form.originalPrice"
            type="number"
            placeholder="Original Price"
          />
        </div>
        <div class="form-group">
          <label>Discount Price</label>
          <input
            v-model.number="form.discountPrice"
            type="number"
            placeholder="Discount Price"
          />
        </div>
        <div class="form-group">
          <label>Cost Price</label>
          <input
            v-model.number="form.costPrice"
            type="number"
            placeholder="Cost Price"
          />
        </div>

        <!-- Row 3: Manufacturing Date & Expiry Date -->
        <div class="form-group">
          <label>Mfg Date</label>
          <input v-model="form.manufacturingDate" type="date" />
        </div>
        <div class="form-group">
          <label>Expiry Date</label>
          <input v-model="form.expiryDate" type="date" />
        </div>

        <!-- Row 4: Batch Number & Rack Number -->
        <div class="form-group">
          <label>Batch Number</label>
          <input
            v-model="form.batchNumber"
            type="text"
            placeholder="Batch Number"
          />
        </div>
        <div class="form-group">
          <label>Rack Number</label>
          <input
            v-model.number="form.rackNumber"
            type="number"
            min="1"
            max="155"
            placeholder="Rack (1-155)"
          />
        </div>

        <!-- Row 5: Category & Shape Selection -->
        <div class="form-group">
          <label>Category</label>
          <select v-model="form.category">
            <option value="" disabled>Select Category</option>
            <option v-for="c in categories" :key="c._id" :value="c._id">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>3D Shape</label>
          <select v-model="form.shape">
            <option value="box">Box (Carton)</option>
            <option value="pillow">Pillow (Packet/Chips)</option>
            <option value="cylinder">Cylinder (Bottle/Can)</option>
            <option value="exact">Exact Shape (From Image)</option>
          </select>
        </div>

        <!-- Row 6: Description (Full Width) -->
        <div class="form-group full-width">
          <label>Description (4-20 chars)</label>
          <textarea
            v-model="form.description"
            placeholder="Description (4-20 chars)"
          ></textarea>
        </div>

        <!-- Row 7: Multi-Image Uploads for 3D Visualization -->
        <div class="form-group full-width">
          <label>Product Images (Upload to replace existing)</label>
          <div class="image-upload-grid">
            <!-- Front Image -->
            <div class="image-upload-item">
              <label class="upload-label">Front Image</label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, 'imageFront')"
                accept="image/*"
              />
              <div
                v-if="previews.imageFront || form.imageFront"
                class="image-preview-mini"
              >
                <img
                  :src="previews.imageFront || getImageUrl(form.imageFront)"
                  alt="Front"
                />
              </div>
            </div>
            <!-- Back Image -->
            <div class="image-upload-item">
              <label class="upload-label">Back Image</label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, 'imageBack')"
                accept="image/*"
              />
              <div
                v-if="previews.imageBack || form.imageBack"
                class="image-preview-mini"
              >
                <img
                  :src="previews.imageBack || getImageUrl(form.imageBack)"
                  alt="Back"
                />
              </div>
            </div>
            <!-- Side Image -->
            <div class="image-upload-item">
              <label class="upload-label">Side Image</label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, 'imageSide')"
                accept="image/*"
              />
              <div
                v-if="previews.imageSide || form.imageSide"
                class="image-preview-mini"
              >
                <img
                  :src="previews.imageSide || getImageUrl(form.imageSide)"
                  alt="Side"
                />
              </div>
            </div>
            <!-- Top Image -->
            <div class="image-upload-item">
              <label class="upload-label">Top Image</label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, 'imageTop')"
                accept="image/*"
              />
              <div
                v-if="previews.imageTop || form.imageTop"
                class="image-preview-mini"
              >
                <img
                  :src="previews.imageTop || getImageUrl(form.imageTop)"
                  alt="Top"
                />
              </div>
            </div>
            <!-- Bottom Image -->
            <div class="image-upload-item">
              <label class="upload-label">Bottom Image</label>
              <input
                type="file"
                @change="(e) => handleImageUpload(e, 'imageBottom')"
                accept="image/*"
              />
              <div
                v-if="previews.imageBottom || form.imageBottom"
                class="image-preview-mini"
              >
                <img
                  :src="previews.imageBottom || getImageUrl(form.imageBottom)"
                  alt="Bottom"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Legacy/Single Image Support -->
        <div class="form-group full-width">
          <label>Legacy Image (fallback)</label>
          <input
            type="file"
            @change="(e) => handleImageUpload(e, 'image')"
            accept="image/*"
          />
          <div v-if="previews.image || form.image" class="image-preview-mini">
            <img
              :src="previews.image || getImageUrl(form.image)"
              alt="Legacy"
            />
          </div>
        </div>

        <!-- 3D Model Upload -->
        <div class="form-group full-width">
          <label>3D Model (.glb, .gltf) - Optional</label>
          <input type="file" @change="handleModelUpload" accept=".glb,.gltf" />
          <div v-if="form.model3D" class="file-hint">
            Current: {{ form.model3D }}
          </div>
        </div>

        <!-- Submit Button -->
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
import axios from "@/utils/axios";

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
        costPrice: null,
        quantity: null,
        manufacturingDate: "",
        expiryDate: "",
        batchNumber: "",
        rackNumber: "",
        category: "",
        shape: "box",
        image: "",
        imageFront: "",
        imageBack: "",
        imageSide: "",
        imageTop: "",
        imageBottom: "",
        model3D: "",
      },
      categories: [],
      files: {
        image: null,
        imageFront: null,
        imageBack: null,
        imageSide: null,
        imageTop: null,
        imageBottom: null,
        model3D: null,
      },
      previews: {
        image: null,
        imageFront: null,
        imageBack: null,
        imageSide: null,
        imageTop: null,
        imageBottom: null,
      },
      loading: false,
    };
  },
  async mounted() {
    await Promise.all([this.loadCategories(), this.fetchProduct()]);
  },
  methods: {
    getImageUrl(path) {
      if (!path) return "";
      return path.startsWith("/") ? path : `/${path}`;
    },
    async loadCategories() {
      try {
        const res = await axios.get("/api/categories");
        this.categories = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.categories)
          ? res.data.categories
          : [];
      } catch (err) {
        console.error("Error loading categories:", err.message);
      }
    },
    async fetchProduct() {
      try {
        const res = await axios.get(
          `/api/products/getproduct/${this.productId}`
        );
        if (res.data.success) {
          const p = res.data.product;

          // Format dates for input[type="date"]
          const mfg = p.manufacturingDate
            ? new Date(p.manufacturingDate).toISOString().split("T")[0]
            : "";
          const exp = p.expiryDate
            ? new Date(p.expiryDate).toISOString().split("T")[0]
            : "";

          this.form = {
            name: p.name,
            description: p.description,
            originalPrice: p.originalPrice,
            discountPrice: p.discountPrice,
            costPrice: p.costPrice,
            quantity: p.quantity,
            manufacturingDate: mfg,
            expiryDate: exp,
            batchNumber: p.batchNumber || "",
            rackNumber: p.rackNumber || "",
            category: p.category?._id || p.category || "",
            shape: p.shape || "box",
            image: p.image || "",
            imageFront: p.imageFront || "",
            imageBack: p.imageBack || "",
            imageSide: p.imageSide || "",
            imageTop: p.imageTop || "",
            imageBottom: p.imageBottom || "",
            model3D: p.model3D || "",
          };
        }
      } catch (err) {
        console.error("Error fetching product:", err.message);
      }
    },
    handleImageUpload(e, type) {
      const file = e.target.files[0];
      if (file) {
        this.files[type] = file;
        this.previews[type] = URL.createObjectURL(file);
      }
    },
    handleModelUpload(e) {
      this.files.model3D = e.target.files[0];
    },
    async updateProduct() {
      this.loading = true;
      try {
        const formData = new FormData();

        // Append basic fields
        Object.keys(this.form).forEach((key) => {
          if (!key.startsWith("image") && key !== "model3D") {
            if (this.form[key] !== null && this.form[key] !== "") {
              formData.append(key, this.form[key]);
            }
          }
        });

        // Append new files if any
        Object.keys(this.files).forEach((key) => {
          if (this.files[key]) {
            formData.append(key, this.files[key]);
          }
        });

        const res = await axios.put(
          `/api/products/updateproduct/${this.productId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.success) {
          this.$emit("updated");
        }
      } catch (err) {
        console.error("Update error:", err.response?.data || err.message);
        alert(err.response?.data?.message || "Failed to update product");
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

.image-upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-top: 5px;
}

.image-upload-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #f8fafc;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.upload-label {
  font-size: 11px;
  font-weight: 600;
}

.image-preview-mini {
  width: 100%;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #cbd5e1;
  background: white;
}

.image-preview-mini img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.file-hint {
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
}

.button-group {
  margin-top: 10px;
}
</style>
