import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { connectDB } from "./mongodb";
import Bot from "./models/Bot";
import { botDeploymentSchema, type User } from "@shared/schema";
import { createHerokuApp, getAppLogs, restartApp, deleteApp } from "./herokuService";
import { generateToken, verifyToken, getUserId as getAuthUserId } from "./auth";

const DEPLOYMENT_COST = 10; // coins per deployment

export async function registerRoutes(app: Express): Promise<Server> {
  // Connect to MongoDB for bot deployments
  await connectDB();

  // Helper to get authenticated user ID from JWT token
  const getUserId = (req: any): string | null => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    
    if (!token) return null;
    
    const decoded = verifyToken(token);
    return decoded ? decoded.userId : null;
  };

  // Middleware to require authentication
  const requireAuth = (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = userId;
    next();
  };

  // Helper function to remove password from user object before sending to client
  const sanitizeUser = (user: User) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  };

  // Auth routes - return user only if authenticated
  app.get("/api/auth/user", async (req, res) => {
    try {
      const userId = getUserId(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json(sanitizeUser(user));
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Register user with email and password
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName, referralCode } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Create user
      const user = await storage.createUserWithPassword({
        email,
        password,
        firstName,
        lastName,
        referredByCode: referralCode,
      });

      // Generate JWT token
      const token = generateToken(user.id);

      res.status(201).json({
        user: sanitizeUser(user),
        token,
      });
    } catch (error) {
      console.error("Error registering user:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Login user with email and password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      // Verify credentials
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = generateToken(user.id);

      res.json({
        user: sanitizeUser(user),
        token,
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  // Validate referral code
  app.get("/api/referral/validate/:code", async (req, res) => {
    try {
      const user = await storage.getUserByReferralCode(req.params.code);
      res.json({ valid: !!user });
    } catch (error) {
      console.error("Error validating referral code:", error);
      res.status(500).json({ message: "Failed to validate referral code" });
    }
  });

  // Logout route - destroy session
  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
      }
      res.redirect("/");
    });
  });

  // Development only - Clear all database data (requires authentication)
  app.post("/api/dev/clear-database", requireAuth, async (req, res) => {
    try {
      // Allow in development mode or when NODE_ENV is not set (defaults to development)
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "This endpoint is not available in production mode" });
      }

      // Clear all bot deployments from MongoDB
      await Bot.deleteMany({});

      // Clear all users from PostgreSQL
      await storage.deleteAllUsers();

      // Destroy current session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });

      res.json({ message: "All database data cleared successfully. You have been logged out." });
    } catch (error) {
      console.error("Error clearing database:", error);
      res.status(500).json({ message: "Failed to clear database" });
    }
  });

  // Development only - Log out all users by clearing sessions
  app.post("/api/dev/logout-all", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "production") {
        return res.status(403).json({ message: "This endpoint is not available in production mode" });
      }

      // Clear all sessions from the database
      await storage.clearAllSessions();

      res.json({ message: "All users have been logged out successfully." });
    } catch (error) {
      console.error("Error logging out all users:", error);
      res.status(500).json({ message: "Failed to log out all users" });
    }
  });

  // Check if user can claim coins
  app.get("/api/coins/can-claim", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const canClaim = await storage.canClaimCoins(userId);
      res.json({ canClaim });
    } catch (error) {
      console.error("Error checking coin claim eligibility:", error);
      res.status(500).json({ message: "Failed to check claim eligibility" });
    }
  });

  // Claim a single coin
  app.post("/api/coins/claim", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const result = await storage.claimCoin(userId);
      if (!result.success) {
        return res.status(400).json({ message: "Cannot claim coins yet. Wait 24 hours between claims." });
      }
      res.json(result);
    } catch (error) {
      console.error("Error claiming coin:", error);
      res.status(500).json({ message: "Failed to claim coin" });
    }
  });

  // Get all user's bot deployments
  app.get("/api/bots", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const bots = await Bot.find({ userId }).sort({ deployedAt: -1 });
      res.json(bots);
    } catch (error) {
      console.error("Error fetching bots:", error);
      res.status(500).json({ message: "Failed to fetch bot deployments" });
    }
  });

  // Get single bot deployment
  app.get("/api/bots/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
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
  app.post("/api/bots", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;

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

          // Update bot status to failed
          await Bot.findByIdAndUpdate(bot._id, {
            status: "failed",
          });

          // Refund coins to user
          const currentUser = await storage.getUser(userId);
          if (currentUser) {
            await storage.updateUserCoins(userId, currentUser.coins + DEPLOYMENT_COST);
          }
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
  app.get("/api/bots/:id/logs", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      try {
        const logs = await getAppLogs(bot.herokuAppName);
        res.json({ logs });
      } catch (error: any) {
        // If Heroku app doesn't exist, return empty logs
        if (error.message.includes('404') || error.message.includes('not_found')) {
          res.json({ logs: "App not found on Heroku. It may have been deleted or failed to deploy." });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      res.status(500).json({ message: "Failed to fetch logs" });
    }
  });

  // Restart bot
  app.post("/api/bots/:id/restart", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      try {
        await restartApp(bot.herokuAppName);
        res.json({ message: "Bot restarted successfully" });
      } catch (error: any) {
        // If Heroku app doesn't exist, return appropriate error
        if (error.message.includes('404') || error.message.includes('not_found')) {
          res.status(404).json({ message: "App not found on Heroku. It may have been deleted or failed to deploy." });
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error restarting bot:", error);
      res.status(500).json({ message: "Failed to restart bot" });
    }
  });

  // Delete bot deployment
  app.delete("/api/bots/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Try to delete from Heroku, but don't fail if app doesn't exist
      try {
        await deleteApp(bot.herokuAppName);
      } catch (error: any) {
        // If Heroku app doesn't exist (404), just log and continue
        if (error.message.includes('404') || error.message.includes('not_found')) {
          console.log(`Heroku app ${bot.herokuAppName} not found, continuing with MongoDB deletion`);
        } else {
          // Re-throw other errors
          throw error;
        }
      }

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