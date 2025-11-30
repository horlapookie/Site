
import Bot from "./models/Bot";
import { storage } from "./storage";
import { restartApp, deleteApp } from "./herokuService";

const MONITOR_INTERVAL = 10 * 60 * 1000; // 10 minutes
const CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour
const MAX_RESTART_ATTEMPTS = 3; // Maximum failed restart attempts before deletion

async function checkAndRestartBots() {
  try {
    console.log(`eclipse [${new Date().toLocaleTimeString()}] Auto-monitor check starting`);
    
    // Get all deployed bots that are stopped or failed
    const Bot = (await import("./models/Bot")).default;
    const bots = await Bot.find({ status: { $in: ["stopped", "failed"] } });
    
    for (const bot of bots) {
      try {
        const user = await storage.getUser(bot.userId);
        
        if (!user) {
          continue;
        }
        
        console.log(`eclipse [${new Date().toLocaleTimeString()}] Attempting restart: ${bot.herokuAppName}`);
        
        // Try to restart the bot (FREE - no coin deduction)
        try {
          await restartApp(bot.herokuAppName);
          
          // Update bot status
          await Bot.findByIdAndUpdate(bot._id, {
            status: "running",
            failureCount: 0
          });

          console.log(`eclipse [${new Date().toLocaleTimeString()}] Restarted: ${bot.herokuAppName}`);

        } catch (restartError: any) {
          console.error(`Auto-monitor: Failed to restart bot ${bot.herokuAppName}:`, restartError.message);
          
          // Increment failure count
          const failureCount = (bot.failureCount || 0) + 1;
          
          // If app doesn't exist on Heroku (404) or account suspended (402), mark as failed and delete after max attempts
          if (restartError.message.includes('404') || restartError.message.includes('not_found') || 
              restartError.message.includes('402') || restartError.message.includes('delinquent')) {
            
            if (failureCount >= MAX_RESTART_ATTEMPTS) {
              console.log(`Auto-monitor: Deleting bot ${bot.herokuAppName} after ${failureCount} failed attempts`);
              
              // Try to delete from Heroku (will fail gracefully if not there)
              try {
                await deleteApp(bot.herokuAppName);
              } catch (deleteError) {
                console.log(`Auto-monitor: Bot ${bot.herokuAppName} not found on Heroku or deletion failed, removing from database only`);
              }
              
              // Delete from database
              await Bot.findByIdAndDelete(bot._id);
              console.log(`Auto-monitor: Bot ${bot.herokuAppName} deleted from database`);
            } else {
              // Update failure count
              await Bot.findByIdAndUpdate(bot._id, {
                status: "failed",
                failureCount: failureCount
              });
              console.log(`Auto-monitor: Bot ${bot.herokuAppName} failure count: ${failureCount}/${MAX_RESTART_ATTEMPTS}`);
            }
          } else {
            // Other errors, just mark as failed
            await Bot.findByIdAndUpdate(bot._id, {
              status: "failed",
              failureCount: failureCount
            });
          }
        }
      } catch (botError: any) {
        console.error(`Auto-monitor: Error processing bot ${bot.herokuAppName}:`, botError);
      }
    }
    
    console.log(`eclipse [${new Date().toLocaleTimeString()}] Auto-monitor check completed`);
  } catch (error: any) {
    console.error("Auto-monitor error:", error.message || error);
  }
}

async function cleanupOldFailedBots() {
  try {
    console.log("Running failed bot cleanup...");
    
    const Bot = (await import("./models/Bot")).default;
    
    // Find bots that have been failed for more than 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const failedBots = await Bot.find({
      status: "failed",
      updatedAt: { $lt: oneDayAgo }
    });
    
    console.log(`Found ${failedBots.length} old failed bots to clean up`);
    
    for (const bot of failedBots) {
      try {
        // Try to delete from Heroku
        try {
          await deleteApp(bot.herokuAppName);
        } catch (deleteError) {
          console.log(`Cleanup: Bot ${bot.herokuAppName} not found on Heroku or deletion failed`);
        }
        
        // Delete from database
        await Bot.findByIdAndDelete(bot._id);
        console.log(`Cleanup: Deleted failed bot ${bot.herokuAppName}`);
      } catch (error: any) {
        console.error(`Cleanup: Error deleting bot ${bot.herokuAppName}:`, error.message);
      }
    }
    
    console.log("Failed bot cleanup completed");
  } catch (error: any) {
    console.error("Cleanup error:", error.message || error);
  }
}

export function startAutoMonitor() {
  console.log("Auto-monitor service started (runs every 10 minutes)");
  
  // Run immediately on startup
  checkAndRestartBots();
  
  // Then run every 10 minutes
  setInterval(checkAndRestartBots, MONITOR_INTERVAL);
  
  // Run cleanup every hour
  setInterval(cleanupOldFailedBots, CLEANUP_INTERVAL);
}
