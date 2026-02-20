<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-green-bg"></div>
      
      <div class="container hero-container">
        <div class="hero-content">
          <div class="hero-badge fade-in">
            <span class="badge-text">Hungry?</span>
          </div>

          <h1 class="hero-title slide-up">
            JUST COME TO <br />
            <span class="brand-text">FOODIED & ORDER</span>
          </h1>

          <p class="hero-subtitle slide-up-delay">
            Here You Will Find All The Best Quality And Pure Food. Order <br />
            Now To Satisfy Your Hunger Pangs.
          </p>

          <div class="hero-cta-group fade-in-delay">
            <button class="btn-primary" @click="scrollToProducts">
              Order Now
            </button>
            <button class="btn-outline" @click="scrollToAbout">
              Explore More →
            </button>
          </div>

          <!-- Featured Items Circular List -->
          <div class="featured-circles">
            <div v-for="(cat, index) in featuredCategories" :key="index" class="category-circle-item">
              <div class="circle-img-wrapper">
                <img :src="cat.image" :alt="cat.name" />
              </div>
              <h4 class="category-circle-name">{{ cat.name }}</h4>
              <p class="category-circle-desc">This is an excellent {{ cat.name.toLowerCase() }} that is very healthy</p>
              <div class="category-footer">
                <span class="category-price">${{ cat.price }}</span>
                <button class="buy-now-mini">Buy Now</button>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-visual">
          <div class="main-food-bowl floating">
            <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Healthy Food Bowl" />
            <!-- Small floating food particles/icons -->
            <div class="particle p1"><img src="https://images.unsplash.com/photo-1598128558393-70ff21433be0?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" /></div>
            <div class="particle p2"><img src="https://images.unsplash.com/photo-1626700051175-6818013e1d4f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" /></div>
            <div class="particle p3"><img src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" /></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="section why-us">
      <div class="container text-center">
        <h2 class="section-title">WHY CHOOSE US?</h2>
        <p class="section-desc">You will choose us because you get the best quality food from us and we deliver fast.</p>

        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon"><i class="icon-food"></i>🥗</div>
            <h3>Serve Healthy Food</h3>
            <p>We serve all healthy food here. You can choose any food you like.</p>
          </div>
          <div class="feature-item active">
            <div class="feature-icon"><i class="icon-quality"></i>💎</div>
            <h3>Best Quality</h3>
            <p>Our food quality is excellent. You will get exactly what you want here.</p>
          </div>
          <div class="feature-item">
            <div class="feature-icon"><i class="icon-delivery"></i>🚚</div>
            <h3>Fast Delivery</h3>
            <p>You can say the main goal of our delivery man is to deliver orders quickly.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Regular Food Section -->
    <section class="section regular-food">
      <div class="container text-center">
        <h2 class="section-title">OUR REGULAR FOOD</h2>
        <p class="section-desc">This is our daily food list. Here you will find all kinds of food, choose your favorite food and order.</p>

        <div class="food-grid">
          <div v-for="(food, index) in regularFood" :key="index" class="food-card">
            <div class="food-img">
              <img :src="food.image" :alt="food.name" />
            </div>
            <div class="food-info">
              <h3>{{ food.name }}</h3>
              <div class="rating">⭐⭐⭐⭐⭐ <span>(100)</span></div>
              <p>This is a great {{ food.name.toLowerCase() }} that is very healthy. You can eat it with any meal.</p>
              <div class="food-footer">
                <span class="food-price">${{ food.price }}</span>
                <button class="buy-now-btn">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Special Chefs Section -->
    <section class="section chefs">
      <div class="container text-center">
        <h2 class="section-title">OUR SPECIAL CHEF'S</h2>
        <p class="section-desc">Featured below are some of our special chefs who work to prepare your meals.</p>

        <div class="chefs-grid">
          <div v-for="(chef, index) in chefs" :key="index" class="chef-card">
            <div class="chef-img">
              <img :src="chef.image" :alt="chef.name" />
            </div>
            <div class="chef-info">
              <h3>{{ chef.name }}</h3>
              <p>{{ chef.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "HomePage",
  data() {
    return {
      featuredCategories: [
        { name: "Chicken Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "3.50" },
        { name: "Chicken Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "3.80" },
        { name: "Chicken Rice", image: "https://images.unsplash.com/photo-1626777552726-4a6b547b4e5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "4.50" },
        { name: "Special Dessert", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "2.50" },
      ],
      regularFood: [
        { name: "Salads", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "4.00" },
        { name: "Chicken Masala", image: "https://images.unsplash.com/photo-1588166524941-3bf61a7c41eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "4.00" },
        { name: "Mutton Kheema", image: "https://images.unsplash.com/photo-1545240203-04c5991112d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "4.80" },
        { name: "Beef Pasta", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "4.00" },
        { name: "Chicken Fry", image: "https://images.unsplash.com/photo-1562967914-608f82629710?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "4.00" },
        { name: "Special Dessert", image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", price: "2.50" },
      ],
      chefs: [
        { name: "Chef Jhon Doe", role: "Head Chef", image: "https://images.unsplash.com/photo-1583394238182-6f71f3ef08c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { name: "Chef Jane Smith", role: "Sous Chef", image: "https://images.unsplash.com/photo-1577214190831-2775f566420f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
        { name: "Chef Robert Brown", role: "Pastry Chef", image: "https://images.unsplash.com/photo-1622023459113-9b195477c9c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" },
      ]
    };
  },
  methods: {
    scrollToProducts() {
      this.$router.push("/user");
    },
    scrollToAbout() {
      const el = document.querySelector(".why-us");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

.home-page {
  font-family: 'Outfit', sans-serif;
  color: #333;
  background-color: #fff;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 80px 0;
}

.text-center { text-align: center; }

.section-title {
  font-size: 2.2rem;
  font-weight: 800;
  margin-bottom: 1rem;
  color: #000;
}

.section-desc {
  font-size: 1rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto 3rem;
  line-height: 1.6;
}

/* --- Hero Section --- */
.hero {
  position: relative;
  min-height: 100vh;
  padding-top: 140px;
  padding-bottom: 60px;
  display: flex;
  align-items: center;
}

.hero-green-bg {
  position: absolute;
  top: -100px;
  right: -50px;
  width: 55%;
  height: 120%;
  background-color: #7ab342;
  border-radius: 0 0 0 500px;
  z-index: -1;
}

.hero-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 3rem;
}

.hero-content {
  flex: 1;
  max-width: 650px;
}

.hero-visual {
  flex: 0.8;
  display: flex;
  justify-content: flex-end;
  position: relative;
}

.hero-badge {
  display: inline-block;
  padding: 0.5rem 1.2rem;
  background: #fdfdfd;
  border: 1px solid #ddd;
  border-radius: 50px;
  margin-bottom: 1.5rem;
}

.badge-text {
  font-weight: 600;
  font-size: 0.9rem;
  color: #333;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: #000;
}

.brand-text {
  color: #000;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #555;
  line-height: 1.6;
  margin-bottom: 2.5rem;
}

.hero-cta-group {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 4rem;
}

.btn-primary {
  background-color: #7ab342;
  color: white;
  padding: 1rem 2.5rem;
  border-radius: 50px;
  border: none;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover {
  background-color: #6a9b39;
  transform: translateY(-3px);
  box-shadow: 0 10px 20px rgba(122, 179, 66, 0.3);
}

.btn-outline {
  padding: 1rem 2.5rem;
  border-radius: 50px;
  border: 1px solid #333;
  background: transparent;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline:hover {
  background-color: #333;
  color: white;
}

/* Featured Circles */
.featured-circles {
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
}

.category-circle-item {
  background: white;
  padding: 1.5rem 1rem;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.05);
  width: 160px;
  transition: transform 0.3s;
}

.category-circle-item:hover {
  transform: translateY(-10px);
}

.circle-img-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #7ab342;
}

.circle-img-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.category-circle-name {
  font-weight: 700;
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.category-circle-desc {
  font-size: 0.7rem;
  color: #888;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.category-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-price {
  font-weight: 800;
  font-size: 0.9rem;
}

.buy-now-mini {
  background: #7ab342;
  color: white;
  border: none;
  padding: 0.3rem 0.6rem;
  border-radius: 5px;
  font-size: 0.7rem;
  font-weight: 700;
  cursor: pointer;
}

/* Main Food Bowl Visual */
.main-food-bowl {
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: white;
  padding: 20px;
  border: 15px solid rgba(255,255,255,0.3);
  position: relative;
}

.main-food-bowl img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.particle {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
}

.particle img { width: 100%; height: 100%; object-fit: cover; }

.p1 { top: 0; right: 20px; }
.p2 { bottom: 20px; right: -30px; }
.p3 { bottom: -10px; left: 50px; }

/* --- Why Choose Us --- */
.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 3rem;
}

.feature-item {
  padding: 3rem 2rem;
  background: #f9f9f9;
  border-radius: 20px;
  transition: all 0.3s;
}

.feature-item.active {
  background: white;
  box-shadow: 0 20px 40px rgba(122, 179, 66, 0.1);
  border: 1px solid #7ab342;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}

.feature-item h3 {
  font-weight: 700;
  margin-bottom: 1rem;
}

.feature-item p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

/* --- Regular Food --- */
.food-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
}

.food-card {
  background: white;
  border-radius: 30px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.05);
  overflow: hidden;
  padding: 1.5rem;
  text-align: left;
}

.food-img {
  width: 150px;
  height: 150px;
  margin: 0 auto 1.5rem;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid #eef6e6;
}

.food-img img { width: 100%; height: 100%; object-fit: cover; }

.food-info h3 {
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.rating {
  color: #ffc107;
  font-size: 0.8rem;
  margin-bottom: 1rem;
}

.rating span { color: #888; margin-left: 5px; }

.food-info p {
  font-size: 0.85rem;
  color: #777;
  line-height: 1.5;
  margin-bottom: 1.5rem;
}

.food-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.food-price {
  font-weight: 800;
  font-size: 1.2rem;
}

.buy-now-btn {
  background: #7ab342;
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
}

/* --- Chefs Section --- */
.chefs-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.chef-card {
  background: #eef6e6;
  border-radius: 20px;
  padding-bottom: 2rem;
  overflow: hidden;
}

.chef-img {
  height: 300px;
  margin-bottom: 1.5rem;
}

.chef-img img { width: 100%; height: 100%; object-fit: cover; }

.chef-info h3 {
  font-weight: 800;
  margin-bottom: 0.3rem;
}

.chef-info p {
  color: #7ab342;
  font-weight: 600;
}

/* Animations */
.floating {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

.fade-in { animation: fadeIn 1s ease-out; }
.slide-up { animation: slideUp 0.8s ease-out; }
.slide-up-delay { animation: slideUp 0.8s ease-out 0.2s both; }
.fade-in-delay { animation: fadeIn 1s ease-out 0.4s both; }

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 1200px) {
  .hero-title { font-size: 3rem; }
  .main-food-bowl { width: 400px; height: 400px; }
}

@media (max-width: 992px) {
  .hero-container { flex-direction: column-reverse; align-items: center; text-align: center; }
  .hero-visual { justify-content: center; }
  .hero-content { margin-top: 3rem; }
  .hero-cta-group { justify-content: center; }
  .featured-circles { justify-content: center; flex-wrap: wrap; }
  .features-grid, .food-grid, .chefs-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-green-bg { width: 100%; border-radius: 0; top: 0; height: 50%; }
}

@media (max-width: 768px) {
  .hero-title { font-size: 2.5rem; }
  .features-grid, .food-grid, .chefs-grid { grid-template-columns: 1fr; }
  .main-food-bowl { width: 300px; height: 300px; }
}
</style>

.about-visual {
  position: relative;
  height: 500px;
}

.visual-card {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  overflow: hidden;
}

.main-card {
  width: 80%;
  height: 80%;
  top: 0;
  left: 0;
  z-index: 1;
}
.float-card {
  width: 60%;
  height: 60%;
  bottom: 0;
  right: 0;
  z-index: 2;
  background: #ffffff;
}

.card-gradient {
  position: absolute;
  inset: 0;
  opacity: 0.1;
}
.gradient-blue {
  background: radial-gradient(circle at top right, #1e3a8a, transparent);
}
.gradient-gold {
  background: radial-gradient(circle at bottom left, #f59e0b, transparent);
}

.visual-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}
.rating-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.rating-text {
  font-weight: 700;
  color: #1e3a8a;
}

/* --- Why Choose Us --- */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.value-card {
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.value-card:hover {
  border-color: #f59e0b;
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.value-icon-wrapper {
  font-size: 2.5rem;
  margin-bottom: 1.5rem;
}
.value-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #0f172a;
}
.value-text {
  color: #64748b;
  line-height: 1.6;
}

/* --- Testimonials --- */
.testimonials-section {
  background: #0f172a;
  color: white;
}
.testimonials-section .section-title {
  color: white;
}
.testimonials-section .section-badge {
  background: rgba(255, 255, 255, 0.1);
  color: #fbbf24;
}
.testimonials-section .section-desc {
  color: #94a3b8;
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.testimonial-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2.5rem;
  border-radius: 20px;
  position: relative;
}

.quote-icon {
  position: absolute;
  top: 1rem;
  right: 2rem;
  font-size: 4rem;
  color: rgba(255, 255, 255, 0.05);
  font-family: serif;
}

.testimonial-text {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #e2e8f0;
  margin-bottom: 2rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fbbf24, #d97706);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #78350f;
}

.author-name {
  font-weight: 700;
  margin-bottom: 0.25rem;
}
.author-role {
  font-size: 0.875rem;
  color: #94a3b8;
}

/* --- Newsletter --- */
.newsletter-box {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 32px;
  padding: 4rem;
  text-align: center;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 2rem;
}

.newsletter-content {
  text-align: left;
  max-width: 500px;
}
.newsletter-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}
.newsletter-desc {
  font-size: 1.1rem;
  color: #bfdbfe;
}

.btn-large {
  padding: 1.25rem 3rem;
  font-size: 1.1rem;
  background: #ffffff;
  color: #1e3a8a;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.btn-large:hover {
  background: #f8fafc;
  transform: translateY(-2px);
  color: #1e3a8a; /* Ensure text color stays readable */
}

/* --- Responsive --- */
@media (max-width: 1024px) {
  .about-grid,
  .values-grid {
    grid-template-columns: 1fr;
  }
  .about-visual {
    display: none;
  } /* Simplify for tablet/mobile */
  .stats-bar {
    position: relative;
    width: 100%;
    top: auto;
    left: auto;
    transform: none;
    bottom: auto;
    margin-top: -3rem;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }
  .stats-bar.slide-up-late {
    transform: none !important;
    opacity: 1 !important;
  }
}

@media (max-width: 768px) {
  .hero {
    padding-top: 6rem;
    padding-bottom: 4rem;
    min-height: auto;
  }

  .hero-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 2rem;
  }

  .hero-cta-group {
    flex-direction: column;
    padding: 0 1rem;
  }

  .btn-primary, .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .newsletter-box {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1.5rem;
  }

  .newsletter-content {
    text-align: center;
  }

  .section {
    padding: 3rem 0;
  }

  .section-title {
    font-size: 1.75rem;
  }

  .stats-bar {
    position: static;
    transform: none !important;
    width: 100%;
    max-width: none;
    border-radius: 0;
    margin-top: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    padding: 2rem 1rem;
    gap: 1.5rem;
  }

  .stat-number {
    font-size: 1.75rem;
  }

  .categories-section {
    padding-top: 3rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .category-card {
    height: 250px;
  }

  .about-visual {
    display: none;
  }

  .feature-item {
    text-align: left;
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .testimonial-card {
    padding: 1.5rem;
  }

  .quote-icon {
    font-size: 2.5rem;
  }
}
</style>
