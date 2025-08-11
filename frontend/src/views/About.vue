<template>
  <div class="about-page">
    <!-- Background image section -->
    <section class="about-banner"></section>

    <!-- About content section -->
    <div class="about-container">
      <!-- Image on left -->
      <div class="about-image" v-scroll-animation>
        <img src="@/assets/bg.jpg" alt="About Us" />
      </div>

      <!-- Text on right -->
      <div class="about-text" v-scroll-animation>
        <h2>Who We Are</h2>
        <p>
          We are a passionate team committed to delivering top-quality products
          and services. Our mission is to bring the best experiences to our
          customers through innovation, dedication, and trust.
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AboutPage",
  directives: {
    scrollAnimation: {
      mounted(el) {
        el.style.opacity = 0;
        el.style.transform = "translateY(30px)";
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                el.style.transition = "all 0.8s ease-out";
                el.style.opacity = 1;
                el.style.transform = "translateY(0)";
              }
            });
          },
          { threshold: 0.2 }
        );
        observer.observe(el);
      },
    },
  },
};
</script>

<style scoped>
.about-page {
  display: flex;
  flex-direction: column;
}

/* Banner background */
.about-banner {
  background: url("@/assets/bakery1.jpg") no-repeat center center/cover;
  height: 300px; /* adjust height */
  width: 100%;
}

/* About content section */
.about-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px;
  max-width: 1200px;
  margin: auto;
  gap: 40px;
}

.about-image img {
  width: 100%;
  height: 350px; /* Adjust image height */
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.about-text {
  max-width: 600px;
}

.about-text h2 {
  font-size: 2.2rem;
  margin-bottom: 15px;
  color: #2c3e50;
}

.about-text p {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
}
</style>
