import mongoose from 'mongoose';
import config from './environment.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`🌿 MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Log error but do not crash process immediately, allow retry
    return null;
  }
};

export default connectDB;
