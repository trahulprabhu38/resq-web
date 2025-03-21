const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const QRCode = require('qrcode');

// Load environment variables based on NODE_ENV
dotenv.config({});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Request logging middleware (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    console.log('Request Body:', req.body);
    next();
  });
}

// MongoDB Connection
const connectDB = async () => {
  try {
    console.log(`=== MongoDB Connection Setup (${process.env.NODE_ENV}) ===`);
    
    mongoose.set('strictQuery', false);

    await mongoose.connect(process.env.MONGODB_URI, {});

    console.log('✅ MongoDB Connected Successfully');
  } catch (error) {
    console.error('🚨 === MongoDB Connection Error ===');
    console.error('Error details:', error);
    
    if (process.env.NODE_ENV === 'production') {
      // In production, retry connection
      console.log('Retrying connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    } else {
      // In development, exit process
      process.exit(1);
    }
  }
};

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error(`=== MongoDB Runtime Error (${process.env.NODE_ENV}) ===`);
  console.error('Error details:', {
    name: err.name,
    message: err.message,
    code: err.code
  });
  
  if (process.env.NODE_ENV === 'production') {
    setTimeout(connectDB, 5000);
  }
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected, attempting to reconnect...');
  if (process.env.NODE_ENV === 'production') {
    setTimeout(connectDB, 5000);
  }
});

mongoose.connection.on('connected', () => {
  console.log(`MongoDB connected (${process.env.NODE_ENV})`);
});

// Connect to MongoDB before starting the server
connectDB().then(async () => {
  // Initialize models
  require('./models/MedicalInfo');
  
  // Routes
  app.use('/api/auth', require('./routes/auth.js'));
  app.use('/api/medical', require('./routes/medical.js'));

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('=== Global Error Handler ===');
    console.error('Error details:', {
      name: err.name,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
    
    // Send appropriate error response
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message || 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`CORS enabled for origin: ${process.env.CORS_ORIGIN}`);
  });
}).catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
}); 
