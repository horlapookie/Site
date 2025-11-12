import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { connectDB } from "./mongodb";
import Bot from "./models/Bot";
import { botDeploymentSchema } from "@shared/schema";
import { createHerokuApp, getAppLogs, restartApp, deleteApp } from "./herokuService";

const DEPLOYMENT_COST = 5; // coins per deployment

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Connect to MongoDB
  await connectDB();

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get all user's bot deployments
  app.get("/api/bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bots = await Bot.find({ userId }).sort({ deployedAt: -1 });
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bot deployments" });
    }
  });

  // Get single bot deployment
  app.get("/api/bots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      res.json(bot);
    } catch (error) {
      console.error("Error fetching bot:", error);
      res.status(500).json({ message: "Failed to fetch bot" });
    }
  });

  // Create new bot deployment
  app.post("/api/bots", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      // Validate input
      const validatedData = botDeploymentSchema.parse(req.body);

      // Check if user has enough coins
      const user = await storage.getUser(userId);
      if (!user || user.coins < DEPLOYMENT_COST) {
        return res.status(400).json({ message: "Insufficient coins" });
      }

      // Generate unique app name
      const appName = `eclipse-md-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;

      // Create bot record in MongoDB
      const bot = new Bot({
        userId,
        herokuAppName: appName,
        ...validatedData,
        status: "deploying",
      });
      await bot.save();

      // Deduct coins
      const deducted = await storage.deductCoins(userId, DEPLOYMENT_COST);
      if (!deducted) {
        await Bot.findByIdAndDelete(bot._id);
        return res.status(400).json({ message: "Failed to deduct coins" });
      }

      // Deploy to Heroku asynchronously
      createHerokuApp(appName, validatedData)
        .then(async (result) => {
          await Bot.findByIdAndUpdate(bot._id, {
            status: "running",
            herokuAppId: result.appId,
          });
        })
        .catch(async (error) => {
          console.error("Heroku deployment failed:", error);
          await Bot.findByIdAndUpdate(bot._id, {
            status: "failed",
          });
          // Refund coins
          await storage.updateUserCoins(userId, (user.coins || 10));
        });

      res.status(201).json(bot);
    } catch (error: any) {
      console.error("Error creating bot deployment:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  // Get bot logs
  app.get("/api/bots/:id/logs", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      const logs = await getAppLogs(bot.herokuAppName);
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Restart bot
  app.post("/api/bots/:id/restart", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      await restartApp(bot.herokuAppName);
      res.json({ message: "Bot restarted successfully" });
    } catch (error) {
      console.error("Error restarting bot:", error);
      res.status(500).json({ message: "Failed to restart bot" });
    }
  });

  // Delete bot deployment
  app.delete("/api/bots/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Delete from Heroku
      await deleteApp(bot.herokuAppName);

      // Delete from MongoDB
      await Bot.findByIdAndDelete(bot._id);

      res.json({ message: "Bot deleted successfully" });
    } catch (error) {
      console.error("Error deleting bot:", error);
      res.status(500).json({ message: "Failed to delete bot" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
