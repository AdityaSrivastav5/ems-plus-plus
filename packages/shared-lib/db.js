const mongoose = require('mongoose');
const config = require('@ems/config');

let isConnected = false;

async function connectDB() {
  if (isConnected) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const mongoUri = config.MONGODB_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = { connectDB, mongoose };
