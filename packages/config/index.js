require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/ems',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
};
