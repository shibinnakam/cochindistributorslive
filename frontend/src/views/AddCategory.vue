<template>
  <div class="page-wrapper">
    <div class="content-container">
      <h2 class="page-title">Category Management</h2>

      <div class="grid-layout">
        <!-- Left Column: Add Category Form -->
        <div class="form-section">
          <div class="form-card">
            <h3 class="card-title">Add New Category</h3>
            <form @submit.prevent="addCategory" class="category-form">
              <div class="form-group">
                <label for="catName">Category Name</label>
                <input
                  id="catName"
                  v-model="name"
                  type="text"
                  placeholder="e.g. Beverages"
                  required
                />
              </div>

              <div class="form-group">
                <label>Category Image</label>
                <div class="file-upload-wrapper">
                  <input
                    type="file"
                    id="fileInput"
                    @change="handleFileUpload"
                    accept="image/png, image/jpeg"
                    class="file-input"
                  />
                  <label for="fileInput" class="file-label">
                    <span v-if="!imageFile">Choose Image...</span>
                    <span v-else>{{ imageFile.name }}</span>
                  </label>
                </div>
                <p class="hint">Supported formats: JPG, PNG</p>
              </div>

              <button type="submit" class="btn-submit">+ Add Category</button>
            </form>
          </div>
        </div>

        <!-- Right Column: Category List -->
        <div class="list-section">
          <div class="table-card">
            <h3 class="card-title">Existing Categories</h3>
            <div class="table-responsive">
              <table class="category-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="categories.length === 0">
                    <td colspan="5" class="empty-state">
                      No categories found. Add one to get started!
                    </td>
                  </tr>
                  <tr v-for="cat in categories" :key="cat._id">
                    <td>
                      <div class="img-wrapper">
                        <img
                          v-if="cat.image"
                          :src="getImageUrl(cat.image)"
                          alt="Category"
                        />
                        <div v-else class="no-img-placeholder">No Img</div>
                      </div>
                    </td>
                    <td>
                      <div v-if="editId !== cat._id" class="cat-name">
                        {{ cat.name }}
                      </div>
                      <input
                        v-else
                        v-model="editName"
                        type="text"
                        class="edit-input"
                        placeholder="Category Name"
                      />
                    </td>
                    <td><span class="badge published">Active</span></td>
                    <td class="date-cell">{{ formatDate(cat.updatedAt) }}</td>
                    <td>
                      <div class="action-buttons">
                        <template v-if="editId !== cat._id">
                          <button
                            @click="startEdit(cat)"
                            class="btn-icon edit"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            @click="openDeleteModal(cat._id)"
                            class="btn-icon delete"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </template>
                        <template v-else>
                          <button
                            @click="updateCategory(cat._id)"
                            class="btn-icon save"
                          >
                            Save
                          </button>
                          <button @click="cancelEdit" class="btn-icon cancel">
                            Cancel
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" @click="closeDeleteModal">×</button>
        <div class="modal-header">
          <h3>Confirm Deletion</h3>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to delete this category?</p>
          <p class="warning-text">This action cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="closeDeleteModal">Cancel</button>
          <button class="btn-delete" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AddCategory",
  data() {
    return {
      name: "",
      imageFile: null,
      categories: [],
      editId: null,
      editName: "",
      showDeleteModal: false,
      deleteId: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.imageFile = event.target.files[0];
    },
    getImageUrl(path) {
      if (!path) return null;
      return path.startsWith("/") ? `http://localhost:5000${path}` : path;
    },
    async fetchCategories() {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        this.categories = res.data;
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    },
    async addCategory() {
      if (!this.name.trim()) return;

      try {
        const formData = new FormData();
        formData.append("name", this.name);
        if (this.imageFile) {
          formData.append("image", this.imageFile);
        }

        const res = await axios.post(
          "http://localhost:5000/api/categories",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        this.categories.unshift(res.data);
        this.name = "";
        this.imageFile = null;
        // Reset file input
        const fileInput = document.getElementById("fileInput");
        if (fileInput) fileInput.value = "";
      } catch (err) {
        alert(err.response?.data?.error || "Error adding category");
      }
    },
    startEdit(cat) {
      this.editId = cat._id;
      this.editName = cat.name;
    },
    cancelEdit() {
      this.editId = null;
      this.editName = "";
    },
    async updateCategory(id) {
      if (!this.editName.trim()) return;

      try {
        const res = await axios.put(
          `http://localhost:5000/api/categories/${id}`,
          {
            name: this.editName,
          }
        );
        const index = this.categories.findIndex((c) => c._id === id);
        if (index !== -1) this.categories[index] = res.data;
        this.editId = null;
        this.editName = "";
      } catch (err) {
        alert(err.response?.data?.error || "Error updating category");
      }
    },

    // 🔴 Open Modal
    openDeleteModal(id) {
      this.deleteId = id;
      this.showDeleteModal = true;
    },
    closeDeleteModal() {
      this.showDeleteModal = false;
      this.deleteId = null;
    },
    async confirmDelete() {
      try {
        await axios.delete(
          `http://localhost:5000/api/categories/${this.deleteId}`
        );
        this.categories = this.categories.filter(
          (c) => c._id !== this.deleteId
        );
        this.closeDeleteModal();
      } catch (err) {
        alert(err.response?.data?.error || "Error deleting category");
      }
    },

    formatDate(date) {
      if (!date) return "-";
      return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
</script>

<style scoped>
/* Page Layout */
.page-wrapper {
  min-height: 100vh;
  background-color: #f1f5f9;
  padding: 40px 20px;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 15px;
}

.grid-layout {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  align-items: start;
}

@media (max-width: 900px) {
  .grid-layout {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.form-card,
.table-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 25px;
  border: 1px solid #e2e8f0;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 20px;
}

/* Form Styles */
.category-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.form-group input[type="text"] {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
  outline: none;
}

.form-group input[type="text"]:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.file-upload-wrapper {
  position: relative;
  overflow: hidden;
  display: inline-block;
}

.file-input {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.file-label {
  display: inline-block;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #475569;
  background-color: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: center;
  transition: all 0.2s;
}

.file-label:hover {
  background-color: #f1f5f9;
  border-color: #94a3b8;
}

.hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
}

.btn-submit {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-top: 10px;
}

.btn-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

/* Table Styles */
.table-responsive {
  overflow-x: auto;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
}

.category-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

.category-table td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
  color: #334155;
  font-size: 14px;
}

.category-table tr:last-child td {
  border-bottom: none;
}

.category-table tr:hover td {
  background-color: #f8fafc;
}

.img-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
}

.img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img-placeholder {
  font-size: 10px;
  color: #94a3b8;
  font-weight: 600;
}

.cat-name {
  font-weight: 500;
  color: #0f172a;
}

.edit-input {
  padding: 6px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  font-size: 14px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.published {
  background-color: #dcfce7;
  color: #166534;
}

.date-cell {
  color: #64748b;
  font-size: 13px;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.edit {
  background-color: #e0f2fe;
  color: #0369a1;
}

.edit:hover {
  background-color: #bae6fd;
}

.delete {
  background-color: #fee2e2;
  color: #b91c1c;
}

.delete:hover {
  background-color: #fecaca;
}

.save {
  background-color: #22c55e;
  color: white;
}

.cancel {
  background-color: #94a3b8;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px !important;
  color: #94a3b8;
  font-style: italic;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  padding: 0;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #1e293b;
}

.modal-body {
  padding: 24px;
}

.modal-body p {
  margin: 0 0 10px;
  color: #475569;
}

.warning-text {
  color: #ef4444 !important;
  font-size: 13px;
  font-weight: 500;
}

.modal-footer {
  padding: 16px 24px;
  background-color: #f8fafc;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 24px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
}

.btn-cancel,
.btn-delete {
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  font-size: 14px;
}

.btn-cancel {
  background: white;
  border: 1px solid #cbd5e1;
  color: #475569;
}

.btn-cancel:hover {
  background: #f1f5f9;
}

.btn-delete {
  background: #ef4444;
  color: white;
}

.btn-delete:hover {
  background: #dc2626;
}
</style>
