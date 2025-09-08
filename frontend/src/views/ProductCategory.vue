<template>
  <div class="category-page">
    <h2>Manage Categories</h2>
    <form @submit.prevent="addCategory">
      <input
        v-model="newCategory"
        type="text"
        placeholder="Enter new category"
        required
      />
      <button type="submit">Add Category</button>
    </form>

    <ul>
      <li v-for="(cat, index) in categories" :key="index">
        {{ cat }}
        <button @click="removeCategory(index)">Remove</button>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "ProductCategory",
  data() {
    return {
      newCategory: "",
      categories: ["Snacks", "Beverages", "Dairy"], // sample default
    };
  },
  methods: {
    addCategory() {
      if (this.newCategory.trim() !== "") {
        this.categories.push(this.newCategory.trim());
        this.newCategory = "";
      }
    },
    removeCategory(index) {
      this.categories.splice(index, 1);
    },
  },
};
</script>

<style scoped>
.category-page {
  padding: 20px;
}
.category-page h2 {
  margin-bottom: 15px;
}
.category-page form {
  margin-bottom: 20px;
}
.category-page input {
  padding: 8px;
  margin-right: 10px;
}
.category-page button {
  padding: 8px 12px;
}
</style>
