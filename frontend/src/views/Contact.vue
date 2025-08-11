<template>
  <div class="contact-page">
    <div class="header-bg"></div>
    <div class="form-wrapper">
      <div class="form-container">
        <h2>Get in Touch</h2>
        <p class="subtitle">Nunc erat cursus tellus gravida.</p>
        <form @submit.prevent="submitForm">
          <div class="row">
            <input
              type="text"
              placeholder="Please enter first name..."
              v-model="form.firstName"
              required
            />
            <input
              type="text"
              placeholder="Please enter last name..."
              v-model="form.lastName"
              required
            />
          </div>
          <div class="row">
            <input
              type="email"
              placeholder="Please enter email..."
              v-model="form.email"
              required
            />
            <input
              type="tel"
              placeholder="Please enter phone number..."
              v-model="form.phone"
            />
          </div>
          <textarea
            placeholder="Please enter query..."
            v-model="form.message"
            rows="4"
            required
          ></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ContactPage",
  data() {
    return {
      form: {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        message: "",
      },
    };
  },
  methods: {
    submitForm() {
      alert("Form submitted successfully!");
    },
  },
};
</script>

<style scoped>
.contact-page {
  background-color: #f9f9f9;
}

.header-bg {
  background-image: url("@/assets/bakery1.jpg");
  background-size: cover;
  background-position: center;
  height: 200px;
  width: 100%;
}

.form-wrapper {
  display: flex;
  justify-content: center;
  margin-top: -100px; /* Pull form up to overlap header */
}

.form-container {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 0.5rem;
}

.subtitle {
  margin-bottom: 1.5rem;
  color: #777;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.row {
  display: flex;
  gap: 1rem;
}

input,
textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
}

button {
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background-color: #2563eb;
}

@media (max-width: 600px) {
  .row {
    flex-direction: column;
  }
}
</style>
