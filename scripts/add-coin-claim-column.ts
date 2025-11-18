
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function addCoinClaimColumn() {
  try {
    console.log("Adding last_coin_claim column to users table...");
    
    await db.execute(sql`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS last_coin_claim TIMESTAMP
    `);
    
    console.log("Successfully added last_coin_claim column!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding column:", error);
    process.exit(1);
  }
}

addCoinClaimColumn();
