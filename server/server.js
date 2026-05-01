require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
console.log('Email Host:', process.env.EMAIL_HOST);
console.log('Email User:', process.env.EMAIL_USER);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/food', require('./routes/foodRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error(err));