const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json()); // This is VERY IMPORTANT

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB Error:', err.message));

// Your auth routes
app.use('/api/auth', require('./routes/auth'));

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
