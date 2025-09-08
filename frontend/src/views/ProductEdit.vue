<template>
  <div class="edit-wrapper">
    <div class="form-card">
      <h2>Edit Product</h2>

      <form @submit.prevent="updateProduct" enctype="multipart/form-data">
        <!-- Name -->
        <div class="form-group">
          <label>Name</label>
          <input v-model="form.name" type="text" />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label>Description</label>
          <textarea v-model="form.description"></textarea>
        </div>

        <!-- Original Price -->
        <div class="form-group">
          <label>Original Price</label>
          <input v-model.number="form.originalPrice" type="number" />
        </div>

        <!-- Discount Price -->
        <div class="form-group">
          <label>Discount Price</label>
          <input v-model.number="form.discountPrice" type="number" />
        </div>

        <!-- Quantity -->
        <div class="form-group">
          <label>Quantity</label>
          <input v-model.number="form.quantity" type="number" />
        </div>

        <!-- Image -->
        <div class="form-group">
          <label>Product Image</label>

          <!-- Show existing image if available -->
          <div v-if="form.image && !imageFile" class="image-preview">
            <img
              :src="`http://localhost:5000${form.image}`"
              alt="Current Product"
            />
          </div>

          <!-- Upload new image -->
          <input type="file" @change="handleFileUpload" />
        </div>

        <button type="submit" class="btn-submit">Update Product</button>
        <button type="button" class="btn-back" @click="$router.push('/admin')">
          Back
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ProductEdit",
  data() {
    return {
      form: {
        name: "",
        description: "",
        originalPrice: null,
        discountPrice: null,
        quantity: null,
        image: "", // keep old image
      },
      imageFile: null,
    };
  },
  async mounted() {
    await this.fetchProduct();
  },
  methods: {
    async fetchProduct() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/products/getproduct/${id}`
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
    },
    async updateProduct() {
      const id = this.$route.params.id;
      try {
        const formData = new FormData();

        // ✅ Append only filled values
        Object.keys(this.form).forEach((key) => {
          if (this.form[key] !== null && this.form[key] !== "") {
            if (key !== "image") {
              formData.append(key, this.form[key]);
            }
          }
        });

        // ✅ New image if chosen
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const res = await axios.put(
          `http://localhost:5000/api/products/updateproduct/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (res.data.success) {
          alert("✅ Product updated successfully!");
          this.$router.push("/admin");
        }
      } catch (err) {
        alert("❌ Error updating product");
        console.error(err.response?.data || err.message);
      }
    },
  },
};
</script>

<style scoped>
.edit-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
}

.form-card {
  background: #fff;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  width: 450px;
}
.btn-back {
  width: 100%;
  padding: 12px;
  border: none;
  background: #6c757d;
  color: #fff;
  font-weight: bold;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 10px;
  transition: 0.3s;
}

.btn-back:hover {
  background: #5a6268;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #444;
}

input,
textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

textarea {
  resize: none;
  min-height: 70px;
}

.image-preview {
  margin-bottom: 10px;
}
.image-preview img {
  max-width: 120px;
  border-radius: 6px;
  border: 1px solid #ddd;
}

.btn-submit {
  width: 100%;
  padding: 12px;
  border: none;
  background: #007bff;
  color: #fff;
  font-weight: bold;
  font-size: 15px;
  border-radius: 8px;
  cursor: pointer;
  transition: 0.3s;
}

.btn-submit:hover {
  background: #0056b3;
}
</style>
