
import Bot from "./models/Bot";
import { storage } from "./storage";
import { deleteApp } from "./herokuService";

const RENEWAL_COST = 10; // coins needed to renew a bot for 5 more days
const RENEWAL_DAYS = 5;

/**
 * Check for expired bots and delete them if user doesn't have enough coins
 */
export async function checkExpiredBots() {
  try {
    const now = new Date();
    
    // Find all bots that have expired
    let expiredBots;
    try {
      expiredBots = await Bot.find({
        expiresAt: { $lte: now },
        status: { $in: ["running", "deploying"] }
      });
    } catch (mongoError: any) {
      console.error("MongoDB error while fetching expired bots:", mongoError);
      return; // Exit early if we can't fetch bots
    }

    console.log(`Found ${expiredBots.length} expired bots to process`);

    for (const bot of expiredBots) {
      try {
        const user = await storage.getUser(bot.userId);
        
        if (!user) {
          console.log(`User not found for bot ${bot.herokuAppName}, deleting bot`);
          await deleteBotAndCleanup(bot);
          continue;
        }

        // Check if user has enough coins to renew
        if (user.coins >= RENEWAL_COST) {
          // Auto-renew the bot
          const success = await storage.deductCoins(bot.userId, RENEWAL_COST);
          
          if (success) {
            // Extend expiration by 5 days
            const newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + RENEWAL_DAYS);
            
            await Bot.findByIdAndUpdate(bot._id, {
              expiresAt: newExpiresAt
            });
            
            console.log(`Bot ${bot.herokuAppName} renewed for user ${user.email}`);
          } else {
            console.log(`Failed to deduct coins for bot ${bot.herokuAppName}, deleting`);
            await deleteBotAndCleanup(bot);
          }
        } else {
          console.log(`User ${user.email} has insufficient coins (${user.coins}/${RENEWAL_COST}) for bot ${bot.herokuAppName}, deleting`);
          await deleteBotAndCleanup(bot);
        }
      } catch (botError: any) {
        console.error(`Error processing bot ${bot.herokuAppName}:`, botError);
        // Continue processing other bots even if one fails
      }
    }
  } catch (error: any) {
    console.error("Error in bot expiration checker:", error.message || error);
  }
}

/**
 * Delete bot from Heroku and MongoDB
 */
async function deleteBotAndCleanup(bot: any) {
  try {
    // Try to delete from Heroku
    try {
      await deleteApp(bot.herokuAppName);
      console.log(`Deleted Heroku app: ${bot.herokuAppName}`);
    } catch (error: any) {
      if (error.message.includes('404') || error.message.includes('not_found')) {
        console.log(`Heroku app ${bot.herokuAppName} not found, continuing with MongoDB deletion`);
      } else {
        console.error(`Error deleting Heroku app ${bot.herokuAppName}:`, error);
      }
    }

    // Delete from MongoDB
    await Bot.findByIdAndDelete(bot._id);
    console.log(`Deleted bot ${bot.herokuAppName} from MongoDB`);
  } catch (error) {
    console.error(`Error cleaning up bot ${bot.herokuAppName}:`, error);
  }
}

/**
 * Start the bot expiration checker (runs every hour)
 */
export function startBotExpirationChecker() {
  // Check immediately on startup
  checkExpiredBots();
  
  // Then check every hour
  setInterval(() => {
    checkExpiredBots();
  }, 60 * 60 * 1000); // 1 hour in milliseconds
  
  console.log("Bot expiration checker started (runs every hour)");
}
