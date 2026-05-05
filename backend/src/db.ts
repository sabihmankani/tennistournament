import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) throw new Error('MONGO_URI is not defined in environment variables');

  await mongoose.connect(mongoURI);
  isConnected = true;
  console.log('MongoDB Connected...');
};

export default connectDB;
