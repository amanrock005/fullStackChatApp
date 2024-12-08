import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`mongooseDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log("mongoose connection err: ", err);
  }
};
