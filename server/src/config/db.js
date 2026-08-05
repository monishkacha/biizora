import mongoose from 'mongoose';

export async function connectDB(uri = process.env.MONGODB_URI) {
  mongoose.set('strictQuery', true);

  console.log("====================================");
  console.log("Mongo URI loaded:", uri ? "YES" : "NO");
  console.log("Mongo URI:", uri);
  console.log("====================================");

  try {
    if (!uri) throw new Error("MONGODB_URI is not set");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (err) {
    console.log("\n========== FULL MONGOOSE ERROR ==========");
    console.dir(err, { depth: null });
    console.log("=========================================\n");

    if (process.env.NODE_ENV === "production") {
      throw err;
    }

    console.warn(
      `MongoDB unavailable (${err.message}). Starting in-memory MongoDB for development...`
    );

    const { MongoMemoryServer } = await import("mongodb-memory-server");

    const memory = await MongoMemoryServer.create();

    const memUri = memory.getUri("biizora");

    await mongoose.connect(memUri);

    console.log("✅ In-memory MongoDB connected (dev fallback)");

    return mongoose.connection;
  }
}