import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { connectDB } from "./mongodb";
import Bot from "./models/Bot";
import User from "./models/User";
import { botDeploymentSchema, type User as UserType } from "@shared/schema";
import { createHerokuApp, updateHerokuApp, getAppLogs, restartApp, deleteApp } from "./herokuService";
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
  const sanitizeUser = (user: UserType) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  };

  // Update user profile
  app.patch("/api/auth/user/profile", requireAuth, async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = (req as any).userId!;

      const updatedUser = await storage.updateUserProfile(userId, {
        firstName: firstName?.trim() || undefined,
        lastName: lastName?.trim() || undefined
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Auth routes - return user only if authenticated
  app.get("/api/auth/user", requireAuth, async (req, res) => {
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

      console.log(`User created successfully: ${email}, has password: ${!!user.password}`);

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

      // Check if user exists first
      const existingUser = await storage.getUserByEmail(email);
      if (!existingUser) {
        console.log(`Login failed: User not found for email ${email}`);
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Verify credentials
      const user = await storage.verifyPassword(email, password);
      if (!user) {
        console.log(`Login failed: Password verification failed for email ${email}`);
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

  // Transfer coins to another user
  app.post("/api/coins/transfer", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { recipientEmail, amount } = req.body;

      if (!recipientEmail || !amount) {
        return res.status(400).json({ message: "Recipient email and amount are required" });
      }

      const parsedAmount = parseInt(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ message: "Amount must be a positive number" });
      }

      const result = await storage.transferCoins(userId, recipientEmail, parsedAmount);

      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }

      const updatedUser = await storage.getUser(userId);
      res.json({
        message: result.message,
        remainingCoins: updatedUser?.coins || 0
      });
    } catch (error) {
      console.error("Error transferring coins:", error);
      res.status(500).json({ message: "Failed to transfer coins" });
    }
  });

  // Get transaction history
  app.get("/api/transactions", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const limit = parseInt(req.query.limit as string) || 50;
      const transactions = await storage.getTransactions(userId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transaction history" });
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

      // Calculate expiration date (5 days from now)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 5);

      // Create bot record in MongoDB
      const bot = new Bot({
        userId,
        herokuAppName: appName,
        ...validatedData,
        status: "deploying",
        expiresAt,
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

  // Update bot configuration (costs 5 coins)
  app.patch("/api/bots/:id", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const bot = await Bot.findOne({ _id: req.params.id, userId });

      if (!bot) {
        return res.status(404).json({ message: "Bot not found" });
      }

      // Check if user has enough coins (5 coins for edit/redeploy)
      const user = await storage.getUser(userId);
      if (!user || user.coins < 5) {
        return res.status(400).json({ message: "Insufficient coins. You need 5 coins to edit and redeploy a bot." });
      }

      // Validate input
      const validatedData = botDeploymentSchema.parse(req.body);

      // Deduct 5 coins
      const deducted = await storage.deductCoins(userId, 5);
      if (!deducted) {
        return res.status(400).json({ message: "Failed to deduct coins" });
      }

      // Update bot configuration in MongoDB
      await Bot.findByIdAndUpdate(bot._id, {
        ...validatedData,
        status: "deploying"
      });

      // Update Heroku app configuration asynchronously
      updateHerokuApp(bot.herokuAppName, validatedData)
        .then(async () => {
          await Bot.findByIdAndUpdate(bot._id, {
            status: "running"
          });
          console.log(`Bot ${bot.herokuAppName} updated and restarted successfully`);
        })
        .catch(async (error) => {
          console.error("Heroku update failed:", error);
          await Bot.findByIdAndUpdate(bot._id, {
            status: "failed"
          });
          // Refund coins to user on failure
          const currentUser = await storage.getUser(userId);
          if (currentUser) {
            await storage.updateUserCoins(userId, currentUser.coins + 5);
          }
        });

      res.json({ message: "Bot update started. Configuration will be updated and bot will restart." });
    } catch (error: any) {
      console.error("Error updating bot:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update bot" });
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

  // Update auto-monitor setting
  app.patch("/api/auth/user/auto-monitor", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { autoMonitor } = req.body;

      if (typeof autoMonitor !== 'number' || (autoMonitor !== 0 && autoMonitor !== 1)) {
        return res.status(400).json({ message: "autoMonitor must be 0 or 1" });
      }

      const updatedUser = await storage.updateAutoMonitor(userId, autoMonitor);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(sanitizeUser(updatedUser));
    } catch (error) {
      console.error("Error updating auto-monitor:", error);
      res.status(500).json({ message: "Failed to update auto-monitor setting" });
    }
  });

  // Admin-only endpoints
  const requireAdmin = async (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const user = await storage.getUser(userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    req.userId = userId;
    next();
  };

  // Get bot statistics (admin only)
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [runningCount, failedCount, deployingCount, stoppedCount, totalUsers, allBots] = await Promise.all([
        Bot.countDocuments({ status: "running" }),
        Bot.countDocuments({ status: "failed" }),
        Bot.countDocuments({ status: "deploying" }),
        Bot.countDocuments({ status: "stopped" }),
        storage.getUserCount(),
        Bot.find({}).select('userId herokuAppName status').lean()
      ]);

      // Group bots by user
      const botsByUser = allBots.reduce((acc: any, bot: any) => {
        const userId = bot.userId;
        if (!acc[userId]) {
          acc[userId] = [];
        }
        acc[userId].push({
          name: bot.herokuAppName,
          status: bot.status
        });
        return acc;
      }, {});

      res.json({
        bots: {
          running: runningCount,
          failed: failedCount,
          deploying: deployingCount,
          stopped: stoppedCount,
          total: runningCount + failedCount + deployingCount + stoppedCount
        },
        users: totalUsers,
        botsByUser
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Get all users with their details (admin only) - with pagination
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = 20;
      const skip = (page - 1) * limit;
      
      // Get users with pagination
      const users = await User.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() as any[];

      // Get total count of users
      const totalUsers = await User.countDocuments();
      
      // Get all user IDs for this page (keep as ObjectID for MongoDB)
      const userIds = users.map(u => u._id);
      
      // Get bot counts for all users using aggregation with ObjectID matching
      const botCounts = await Bot.aggregate([
        { 
          $match: { 
            userId: { 
              $in: userIds 
            } 
          } 
        },
        { 
          $group: { 
            _id: "$userId", 
            count: { $sum: 1 } 
          } 
        }
      ]) as any[];
      
      // Create a map for quick lookup
      const botCountMap: Record<string, number> = {};
      botCounts.forEach((item: any) => {
        const key = item._id.toString();
        botCountMap[key] = item.count;
        console.log(`Aggregation found: ${key} = ${item.count} bots`);
      });
      
      // Map users with bot count
      const usersWithBotCount = users.map(user => {
        const userId = user._id.toString();
        const botCount = botCountMap[userId] || 0;
        
        console.log(`User ${user.email} (${userId}): ${botCount} bots`);
        
        return {
          id: userId,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          coins: user.coins,
          isAdmin: user.isAdmin,
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          autoMonitor: user.autoMonitor,
          createdAt: user.createdAt,
          botCount
        };
      });
      
      res.json({
        users: usersWithBotCount,
        pagination: {
          page,
          limit,
          total: totalUsers,
          pages: Math.ceil(totalUsers / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Task system routes (using storage layer for security)
  
  // Get all tasks with completion status
  app.get("/api/tasks", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const completedTasks = await storage.getTaskCompletions(userId);
      const today = new Date().toDateString();

      const adTask = completedTasks.find(t => t.taskId === 'view_ads_daily');
      const adsWatchedToday = adTask?.metadata?.lastAdWatchDate === today ? (adTask.metadata.adsWatchedToday || 0) : 0;

      const tasks = [
        {
          id: 'notification_permission',
          title: 'Enable Notifications',
          description: 'Allow site notifications to earn 2 coins',
          reward: 2,
          icon: 'Bell',
          completed: completedTasks.some(t => t.taskId === 'notification_permission'),
          canComplete: !completedTasks.some(t => t.taskId === 'notification_permission'),
        },
        {
          id: 'view_ads_daily',
          title: 'View Ads',
          description: 'Watch ads for 5 seconds to earn 1 coin (max 10 per day)',
          reward: 1,
          icon: 'Eye',
          completed: false,
          canComplete: adsWatchedToday < 10,
          dailyLimit: 10,
          dailyProgress: adsWatchedToday,
        },
        {
          id: 'whatsapp_follow',
          title: 'Follow us on WhatsApp',
          description: 'Join our WhatsApp channel to earn 1 coin',
          reward: 1,
          icon: 'MessageCircle',
          completed: completedTasks.some(t => t.taskId === 'whatsapp_follow'),
          canComplete: !completedTasks.some(t => t.taskId === 'whatsapp_follow'),
          link: 'https://whatsapp.com/channel/0029VarnKCp2YlEkLSeF2M0F',
        },
        {
          id: 'telegram_follow',
          title: 'Follow us on Telegram',
          description: 'Join our Telegram channel to earn 1 coin',
          reward: 1,
          icon: 'Send',
          completed: completedTasks.some(t => t.taskId === 'telegram_follow'),
          canComplete: !completedTasks.some(t => t.taskId === 'telegram_follow'),
          link: 'https://t.me/yourhighnesstech1',
        },
        {
          id: 'referral_milestone',
          title: 'Refer 5 Friends',
          description: 'Get 5 referrals to earn 2 coins',
          reward: 2,
          icon: 'Users',
          completed: completedTasks.some(t => t.taskId === 'referral_milestone'),
          canComplete: (user.referralCount || 0) >= 5 && !completedTasks.some(t => t.taskId === 'referral_milestone'),
        },
        {
          id: 'watch_ads_video',
          title: 'Watch 3 Video Ads',
          description: 'Watch 3 video advertisements to earn 2 coins',
          reward: 2,
          icon: 'Video',
          completed: completedTasks.some(t => t.taskId === 'watch_ads_video'),
          canComplete: !completedTasks.some(t => t.taskId === 'watch_ads_video'),
        },
      ];

      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Complete a task (using storage layer)
  app.post("/api/tasks/:taskId/complete", requireAuth, async (req, res) => {
    try {
      const userId = getUserId(req)!;
      const { taskId } = req.params;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingCompletion = await storage.getTaskCompletion(userId, taskId);
      const today = new Date().toDateString();
      
      if (taskId === 'view_ads_daily') {
        const adsWatchedToday = existingCompletion?.metadata?.lastAdWatchDate === today ? 
          (existingCompletion.metadata.adsWatchedToday || 0) : 0;
        
        if (adsWatchedToday >= 10) {
          return res.status(400).json({ message: "Daily limit reached" });
        }

        const newCount = adsWatchedToday + 1;
        if (existingCompletion) {
          await storage.updateTaskMetadata(userId, taskId, {
            adsWatchedToday: newCount,
            lastAdWatchDate: today,
          });
        } else {
          await storage.completeTask(userId, taskId, {
            adsWatchedToday: newCount,
            lastAdWatchDate: today,
          });
        }
      } else {
        if (existingCompletion) {
          return res.status(400).json({ message: "Task already completed" });
        }

        if (taskId === 'referral_milestone' && (user.referralCount || 0) < 5) {
          return res.status(400).json({ message: "You need 5 referrals to complete this task" });
        }

        const completed = await storage.completeTask(userId, taskId);
        if (!completed) {
          return res.status(400).json({ message: "Task already completed" });
        }
      }

      const rewards: Record<string, number> = {
        notification_permission: 2,
        view_ads_daily: 1,
        whatsapp_follow: 1,
        telegram_follow: 1,
        referral_milestone: 2,
        watch_ads_video: 2,
      };

      const reward = rewards[taskId] || 0;
      await storage.addCoins(userId, reward, `Completed task: ${taskId}`);

      res.json({ 
        success: true, 
        reward,
        message: `Task completed! You earned ${reward} coins.` 
      });
    } catch (error) {
      console.error("Error completing task:", error);
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}