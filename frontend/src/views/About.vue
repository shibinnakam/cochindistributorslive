<template>
  <div class="about-page">
    <!-- Top Image -->
    <img src="@/assets/bg.jpg" alt="About Top Banner" class="top-banner" />

    <!-- Animated Section -->
    <div class="about-content">
      <!-- Image Slide from Left -->
      <div class="about-image" v-if="visible">
        <img src="@/assets/login-bg.jpg" alt="Who We Are" />
      </div>

      <!-- Text Slide from Right inside Box -->
      <div class="about-text-box" v-if="visible">
        <h2 class="cochinhead">Who We Are</h2>
        <div class="cochintext">
          <p>
            Cochin Distributors is a dedicated supplier of high-quality bakery products, committed to serving customers
            with efficiency, reliability, and innovation.
          </p>
          <p>
            We believe in empowering local businesses and maintaining strong relationships with our clients. Our focus
            is not just on delivering products but building trust and supporting growth in the food and distribution
            industry.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage',
  data() {
    return {
      visible: false
    };
  },
  mounted() {
    setTimeout(() => {
      this.visible = true;
    }, 300);
  }
};
</script>

<style scoped>
/* Full page should scroll if overflow */
.about-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* Top banner */
.top-banner {
  width: 100%;
  height: 300px;
  object-fit: cover;
  margin-bottom: 30px;
}

/* Main content section */
.about-content {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px;
  gap: 50px;
  width: 90%;
  max-width: 1200px;
  flex-wrap: wrap;
}

/* Left-side image */
.about-image img {
  width: 300px;
  height: auto;
  border-radius: 12px;
  opacity: 0;
  transform: translateX(-100px);
  animation: slideInLeft 1s forwards;
}

/* Text box with border and background */
.about-text-box {
  max-width: 600px;
  background-color: #f7f7f7;
  padding: 25px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateX(100px);
  animation: slideInRight 1s forwards;
}

.cochinhead {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #2c3e50;
}

.cochintext p {
  font-size: 16px;
  line-height: 1.7;
  color: #444;
  margin-bottom: 12px;
  text-align: justify; 
}

/* Slide animations */
@keyframes slideInLeft {
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>

<!-- Global Scrollbar Styles: NOT Scoped -->
<style>
/* Scrollbar Styles - Very Light Green (Professional Look) */

/* Chrome, Safari, Edge */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f5fff5; /* Very light green background */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background-color: #b7e4c7; /* Soft green thumb */
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background-color: #95d5b2; /* Darker on hover */
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #b7e4c7 #f5fff5;
}
</style>
