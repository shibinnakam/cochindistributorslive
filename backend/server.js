const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const bcrypt = require('bcryptjs');        // Add bcrypt for password hashing
const User = require('./models/User');      // Import your User model

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

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

// Import routes and use them
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
