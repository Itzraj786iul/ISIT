import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import ALL models to ensure they are registered globally
import User from '@/models/User';
import Course from '@/models/Course';
import Lesson from '@/models/Lesson';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  throw new Error('Please define MONGO_URI in .env file');
}

// Global is to prevent multiple connections in development (hot-reloading)
const globalForMongoose = global as unknown as { conn: mongoose.Connection };

const connectToDB = async () => {
  if (globalForMongoose.conn) {
    return globalForMongoose.conn;
  }

  const connection = await mongoose.connect(MONGO_URI);
  globalForMongoose.conn = connection;

  return connection;
};

export default connectToDB;