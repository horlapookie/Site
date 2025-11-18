
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

const MOCK_USER_ID = "dev-user-123";

async function resetUserCoins() {
  try {
    console.log("Resetting user coins...");
    
    await db.update(users)
      .set({ 
        coins: 0,
        lastCoinClaim: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, MOCK_USER_ID));
    
    console.log("Successfully reset user coins to 0 and cleared claim history!");
    process.exit(0);
  } catch (error) {
    console.error("Error resetting coins:", error);
    process.exit(1);
  }
}

resetUserCoins();
