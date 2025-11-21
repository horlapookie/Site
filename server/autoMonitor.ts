
import Bot from "./models/Bot";
import { storage } from "./storage";
import { restartApp } from "./herokuService";

const MONITOR_INTERVAL = 10 * 60 * 1000; // 10 minutes
const MONITOR_COST = 5; // 5 coins per restart

async function checkAndRestartBots() {
  try {
    console.log("Running auto-monitor check...");
    
    // Get all users with auto-monitor enabled
    const Bot = (await import("./models/Bot")).default;
    const bots = await Bot.find({ status: { $in: ["stopped", "failed"] } });
    
    for (const bot of bots) {
      try {
        const user = await storage.getUser(bot.userId);
        
        // Skip if user doesn't have auto-monitor enabled
        if (!user || user.autoMonitor !== 1) {
          continue;
        }

        // Check if user has enough coins
        if (user.coins < MONITOR_COST) {
          console.log(`User ${user.email} has insufficient coins (${user.coins}/${MONITOR_COST}) for auto-monitor, skipping bot ${bot.herokuAppName}`);
          continue;
        }
        
        console.log(`Auto-monitor: Attempting to restart bot ${bot.herokuAppName} for user ${user.email}`);
        
        // Try to restart the bot
        try {
          await restartApp(bot.herokuAppName);
          
          // Update bot status
          await Bot.findByIdAndUpdate(bot._id, {
            status: "running"
          });

          // Deduct coins for the restart
          const deducted = await storage.deductCoins(bot.userId, MONITOR_COST);
          if (deducted) {
            console.log(`Auto-monitor: Successfully restarted bot ${bot.herokuAppName} and deducted ${MONITOR_COST} coins`);
          } else {
            console.log(`Auto-monitor: Bot ${bot.herokuAppName} restarted but failed to deduct coins`);
          }
        } catch (restartError: any) {
          console.error(`Auto-monitor: Failed to restart bot ${bot.herokuAppName}:`, restartError.message);
          
          // If app doesn't exist on Heroku, mark as failed
          if (restartError.message.includes('404') || restartError.message.includes('not_found')) {
            await Bot.findByIdAndUpdate(bot._id, {
              status: "failed"
            });
          }
        }
      } catch (botError: any) {
        console.error(`Auto-monitor: Error processing bot ${bot.herokuAppName}:`, botError);
      }
    }
    
    console.log("Auto-monitor check completed");
  } catch (error: any) {
    console.error("Auto-monitor error:", error.message || error);
  }
}

export function startAutoMonitor() {
  console.log("Auto-monitor service started (runs every 10 minutes)");
  
  // Run immediately on startup
  checkAndRestartBots();
  
  // Then run every 10 minutes
  setInterval(checkAndRestartBots, MONITOR_INTERVAL);
}
