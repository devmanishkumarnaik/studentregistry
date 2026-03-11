import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is not set.\n" +
    "Copy .env.local.example to .env.local and add your MongoDB Atlas connection string."
  );
}

let cached = global.mongoose;
if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        console.log("✅ MongoDB connected:", m.connection.host);
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("❌ MongoDB connection failed:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
