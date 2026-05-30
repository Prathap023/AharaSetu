const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Allow ALL origins for now
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT} and connected to aharasetu.in`)
    );
  })
  .catch(err => console.error(err));