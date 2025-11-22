
import Bot from "./models/Bot";
import { storage } from "./storage";
import { restartApp } from "./herokuService";

const MONITOR_INTERVAL = 10 * 60 * 1000; // 10 minutes

async function checkAndRestartBots() {
  try {
    console.log("Running auto-monitor check...");
    
    // Get all deployed bots that are stopped or failed
    const Bot = (await import("./models/Bot")).default;
    const bots = await Bot.find({ status: { $in: ["stopped", "failed"] } });
    
    for (const bot of bots) {
      try {
        const user = await storage.getUser(bot.userId);
        
        if (!user) {
          continue;
        }
        
        console.log(`Auto-monitor: Attempting to restart bot ${bot.herokuAppName} for user ${user.email}`);
        
        // Try to restart the bot (FREE - no coin deduction)
        try {
          await restartApp(bot.herokuAppName);
          
          // Update bot status
          await Bot.findByIdAndUpdate(bot._id, {
            status: "running"
          });

          console.log(`Auto-monitor: Successfully restarted bot ${bot.herokuAppName} (FREE service)`);

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
