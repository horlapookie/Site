import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, index, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  coins: integer("coins").default(10).notNull(),
  lastCoinClaim: timestamp("last_coin_claim"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  referralCount: integer("referral_count").default(0).notNull(),
  autoMonitor: integer("auto_monitor").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect & { isAdmin?: boolean };

// Bot deployment types (stored in MongoDB)
export const botDeploymentSchema = z.object({
  botNumber: z.string().min(1, "WhatsApp number is required"),
  sessionData: z.string().min(1, "Session ID is required"),
  prefix: z.string().default("."),
  openaiKey: z.string().optional(),
  geminiKey: z.string().optional(),
  autoViewMessage: z.boolean().default(false),
  autoViewStatus: z.boolean().default(false),
  autoReactStatus: z.boolean().default(false),
  autoReact: z.boolean().default(false),
  autoTyping: z.boolean().default(false),
  autoRecording: z.boolean().default(false),
});

export type BotDeploymentInput = z.infer<typeof botDeploymentSchema>;

// Task types
export const TASKS = {
  NOTIFICATION_PERMISSION: 'notification_permission',
  VIEW_ADS_DAILY: 'view_ads_daily',
  WHATSAPP_FOLLOW: 'whatsapp_follow',
  TELEGRAM_FOLLOW: 'telegram_follow',
  REFERRAL_MILESTONE: 'referral_milestone',
  WATCH_ADS_VIDEO: 'watch_ads_video',
} as const;

export const TASK_REWARDS = {
  [TASKS.NOTIFICATION_PERMISSION]: 2,
  [TASKS.VIEW_ADS_DAILY]: 1,
  [TASKS.WHATSAPP_FOLLOW]: 1,
  [TASKS.TELEGRAM_FOLLOW]: 1,
  [TASKS.REFERRAL_MILESTONE]: 2,
  [TASKS.WATCH_ADS_VIDEO]: 2,
} as const;

export type TaskId = typeof TASKS[keyof typeof TASKS];

export interface TaskInfo {
  id: TaskId;
  title: string;
  description: string;
  reward: number;
  icon: string;
  completed: boolean;
  canComplete: boolean;
  dailyLimit?: number;
  dailyProgress?: number;
  link?: string;
}