require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs'); // For password hashing
const http = require('http');
const socketIo = require('socket.io');
const User = require('./models/User');

// Routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/ProductRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const staffRoutes = require("./routes/staff");
const leaveRoutes = require("./routes/leaves");
const messageRoutes = require("./routes/messages");
const cartRoutes = require("./routes/cartRoutes");
const chatRoutes = require("./routes/ChatRoutes");
const orderRoutes = require("./routes/orderRoutes");
const walletRoutes = require("./routes/walletRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const server = http.createServer(app);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:8080";

const io = socketIo(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"]
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join', (data) => {
    const { token } = data;
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(decoded.id);
        console.log(`User ${decoded.id} joined room`);

        // If user is admin, also join admin room
        if (decoded.role === 'admin') {
          socket.join('admin');
          console.log(`Admin ${decoded.id} joined admin room`);
        }
      } catch (error) {
        console.error('Invalid token for socket join:', error);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');

    // Create or update default admin user
    const adminEmail = 'admincd@gmail.com';
    const adminPassword = 'admin@123';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const adminUser = new User({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        name: 'Admin',
      });
      await adminUser.save();
      console.log('Default admin user created');
    } else {
      // Ensure the admin has the correct password and role
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      await existingAdmin.save();
      console.log('Admin user updated with requested credentials');
    }
  })
  .catch((err) => console.error('MongoDB Error:', err.message));

const locationRoutes = require("./routes/locationRoutes");

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes(io)); // Pass io to productRoutes
app.use('/api/categories', categoryRoutes(io)); // Pass io to categoryRoutes
app.use("/api/staff", staffRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/cart", cartRoutes(io)); // Pass io to cartRoutes
app.use("/api/chat", chatRoutes);
app.use("/api/orders", orderRoutes(io)); // Pass io to orderRoutes
app.use("/api/wallet", walletRoutes(io)); // Pass io to walletRoutes
app.use("/api/reviews", reviewRoutes);
app.use("/api/location", locationRoutes);

// Serve Static Files and Handle SPA Routing in Production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    }
  });
}

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
