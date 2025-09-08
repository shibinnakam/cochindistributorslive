<template>
  <div class="category-container">
    <h2>Category Management</h2>

    <!-- Add Form -->
    <form @submit.prevent="addCategory" class="add-form">
      <input
        v-model="name"
        type="text"
        placeholder="Enter category name"
        required
      />
      <button type="submit">+ Add New Category</button>
    </form>

    <!-- Table -->
    <table class="category-table">
      <thead>
        <tr>
          <th>Category Name</th>
          <th>Status</th>
          <th>Last Updated</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cat in categories" :key="cat._id">
          <td>
            <span v-if="editId !== cat._id">{{ cat.name }}</span>
            <input
              v-else
              v-model="editName"
              type="text"
              placeholder="Update category"
            />
          </td>
          <td><span class="published">Published</span></td>
          <td>{{ formatDate(cat.updatedAt) }}</td>
          <td>
            <button
              v-if="editId !== cat._id"
              @click="startEdit(cat)"
              class="btn-icon edit"
            >
              Edit
            </button>

            <button
              v-if="editId === cat._id"
              @click="updateCategory(cat._id)"
              class="btn-icon save"
            >
              Save
            </button>

            <button @click="openDeleteModal(cat._id)" class="btn-icon delete">
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <button class="close-btn" @click="closeDeleteModal">✖</button>
        <h3>Are you sure you want to permanently delete this category?</h3>
        <p>This change cannot be undone.</p>
        <div class="modal-actions">
          <button class="cancel" @click="closeDeleteModal">Cancel</button>
          <button class="confirm" @click="confirmDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      name: "",
      categories: [],
      editId: null,
      editName: "",
      showDeleteModal: false,
      deleteId: null,
    };
  },
  methods: {
    async fetchCategories() {
      try {
        const res = await axios.get("http://localhost:5000/api/categories");
        this.categories = res.data;
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    },
    async addCategory() {
      try {
        const res = await axios.post("http://localhost:5000/api/categories", {
          name: this.name,
        });
        this.categories.unshift(res.data);
        this.name = "";
      } catch (err) {
        alert(err.response?.data?.error || "Error adding category");
      }
    },
    startEdit(cat) {
      this.editId = cat._id;
      this.editName = cat.name;
    },
    async updateCategory(id) {
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
      return new Date(date).toLocaleString();
    },
  },
  mounted() {
    this.fetchCategories();
  },
};
</script>
<style scoped>
/* --- Table Styles --- */
.category-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-family: Arial, sans-serif;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  overflow: hidden;
}

.category-table thead {
  background: #f8f9fa; /* Light grey like screenshot */
  color: #333; /* Dark text */
  font-weight: 600;
  text-align: left;
  border-bottom: 2px solid #dee2e6; /* subtle border */
}
.category-table th {
  padding: 14px 18px;
  font-size: 15px;
}
.category-table td {
  padding: 12px 16px;
}

.category-table tbody tr {
  border-bottom: 1px solid #ddd;
  transition: background 0.2s ease;
  background: #fff;
}

.category-table tbody tr:hover {
  background: #f9f9f9;
}

/* Published Status Badge */
.published {
  background: #2ecc71;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}

/* --- Buttons (Edit, Save, Delete) --- */
.btn-icon {
  border: none;
  padding: 6px 16px;
  margin-right: 6px;
  border-radius: 6px;
  color: #fff;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(135deg, #34495e, #2c3e50);
  transition: transform 0.2s ease, opacity 0.2s ease;
  font-size: 14px;
}

.btn-icon:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* Remove icons inside buttons, keep text only */
.btn-icon.edit::before,
.btn-icon.save::before,
.btn-icon.delete::before {
  content: "";
}

/* Add New Category button style */
.add-form button {
  background: linear-gradient(135deg, #34495e, #2c3e50);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.add-form button:hover {
  transform: translateY(-2px);
  opacity: 0.9;
}

/* --- Modal Styles --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.modal {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  width: 420px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  text-align: center;
  position: relative;
}

.modal h3 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.modal p {
  font-size: 14px;
  color: #666;
  margin-bottom: 18px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel {
  background: transparent;
  border: none;
  color: #555;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 14px;
}

.confirm {
  background: #e74c3c;
  border: none;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition: all 0.2s ease-in-out;
}
.confirm:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  color: #888;
}
.close-btn:hover {
  color: #333;
}
</style>
