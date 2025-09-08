require('dotenv').config(); 
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // For password hashing
const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/ProductRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const staffRoutes = require("./routes/staff");
const leaveRoutes = require("./routes/leaves");



const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Create default admin user if not exists
    const adminEmail = 'admincd@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
      });
      await adminUser.save();
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }
  })
  .catch((err) => console.error('MongoDB Error:', err.message));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);  
app.use('/api/categories', categoryRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/leaves", leaveRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
