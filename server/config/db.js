import mongoose from 'mongoose';

/**
 * Connect to MongoDB Atlas via Mongoose
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.warn('⚠️ MONGO_URI is not defined in environment variables.');
      return false;
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // In production we exit on failure, in local dev we log
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return false;
  }
};

export default connectDB;
