
import { connectDB } from "../server/mongodb";
import User from "../server/models/User";
import Bot from "../server/models/Bot";

async function clearAllAccounts() {
  try {
    await connectDB();
    
    console.log("Deleting all users...");
    const userResult = await User.deleteMany({});
    console.log(`✅ Deleted ${userResult.deletedCount} users`);
    
    console.log("Deleting all bots...");
    const botResult = await Bot.deleteMany({});
    console.log(`✅ Deleted ${botResult.deletedCount} bots`);
    
    console.log("\n✅ All accounts and bots have been cleared successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing accounts:", error);
    process.exit(1);
  }
}

clearAllAccounts();
