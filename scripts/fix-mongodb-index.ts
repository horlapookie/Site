
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI environment variable is not set");
  process.exit(1);
}

async function fixIndex() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection('bots');

    // List all indexes
    const indexes = await collection.indexes();
    console.log("Current indexes:", JSON.stringify(indexes, null, 2));

    // Drop the problematic containerName index if it exists
    try {
      await collection.dropIndex('containerName_1');
      console.log("Successfully dropped containerName_1 index");
    } catch (error: any) {
      if (error.code === 27) {
        console.log("Index containerName_1 doesn't exist, nothing to drop");
      } else {
        throw error;
      }
    }

    // Optionally, delete all bots to start fresh
    const result = await collection.deleteMany({});
    console.log(`Deleted ${result.deletedCount} bot records`);

    console.log("MongoDB cleanup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error fixing MongoDB index:", error);
    process.exit(1);
  }
}

fixIndex();
