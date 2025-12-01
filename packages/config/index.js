require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://adityasrivastav863:iamaditya05@cluster0.svxvssj.mongodb.net/ems?retryWrites=true&w=majority&appName=Cluster0',
  REDIS_URL: process.env.REDIS_URL || 'redis://default:AZSKAAIncDI5MDBkY2M3NTdmNzc0NmQwOTUxZWZkZjBjNDM4NDhjMHAyMzgwMjY@stable-guppy-38026.upstash.io:6379',
};
