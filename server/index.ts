import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";
const { Pool } = pkg;
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();

// Setup session store
const PgSession = connectPgSimple(session);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.set("trust proxy", 1);

app.use(
  session({
    store: new PgSession({
      pool,
      tableName: "sessions",
      createTableIfMissing: true,
    }),
    name: "connect.sid",
    secret: process.env.SESSION_SECRET || "eclipse-md-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    rolling: true,
    proxy: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      domain: undefined, // Let browser determine domain
    },
  })
);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

async function startBotExpirationChecker() {
  log("Starting bot expiration checker...");
  const CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
  const BOT_EXPIRY_DAYS = 5;
  const COINS_PER_DEPLOYMENT = 10;

  setInterval(async () => {
    log("Running bot expiration check...");
    try {
      // Get all deployed bots
      const { rows: bots } = await pool.query("SELECT * FROM deployed_bots");

      for (const bot of bots) {
        const now = new Date();
        const deploymentDate = new Date(bot.deployment_date);
        const timeDiff = now.getTime() - deploymentDate.getTime();
        const daysDiff = timeDiff / (1000 * 3600 * 24);

        if (daysDiff > BOT_EXPIRY_DAYS) {
          // Check if user has enough coins for renewal
          const { rows: [user] } = await pool.query("SELECT coins FROM users WHERE id = $1", [bot.user_id]);

          if (user && user.coins >= COINS_PER_DEPLOYMENT) {
            // Deduct coins and reset deployment date
            await pool.query("UPDATE users SET coins = coins - $1 WHERE id = $2", [COINS_PER_DEPLOYMENT, bot.user_id]);
            await pool.query("UPDATE deployed_bots SET deployment_date = $1 WHERE id = $2", [now.toISOString(), bot.id]);
            log(`Bot ${bot.id} renewed for user ${bot.user_id}.`);
          } else {
            // Delete bot if user has insufficient coins
            await pool.query("DELETE FROM deployed_bots WHERE id = $1", [bot.id]);
            log(`Bot ${bot.id} deleted for user ${bot.user_id} due to insufficient coins.`);
          }
        }
      }
    } catch (error) {
      log(`Error in bot expiration checker: ${error}`);
    }
  }, CHECK_INTERVAL);
}

(async () => {
  const server = await registerRoutes(app);

  // Start bot expiration checker
  startBotExpirationChecker();

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();