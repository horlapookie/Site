import { users, type User, type UpsertUser } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";
import { sessions } from "@shared/schema";
import bcrypt from "bcryptjs";

interface UpsertUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  referredByCode?: string;
}

interface CreateUserWithPassword {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  referredByCode?: string;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserCoins(id: string, coins: number): Promise<void>;
  deductCoins(id: string, amount: number): Promise<boolean>;
  canClaimCoins(id: string): Promise<boolean>;
  claimCoin(id: string): Promise<{ success: boolean; coinsRemaining: number; totalCoins: number }>;
  deleteAllUsers(): Promise<void>;
  clearAllSessions(): Promise<void>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUserWithPassword(userData: CreateUserWithPassword): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | null>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async generateUniqueReferralCode(): Promise<string> {
    let code: string;
    let exists = true;

    while (exists) {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const existing = await this.getUserByReferralCode(code);
      exists = !!existing;
    }

    return code!;
  }

  async upsertUser(userData: UpsertUser & { referredByCode?: string }): Promise<User> {
    const referralCode = await this.generateUniqueReferralCode();
    let referredBy: string | null = null;
    let bonusCoins = 10;

    // Check if user was referred
    if (userData.referredByCode) {
      const referrer = await this.getUserByReferralCode(userData.referredByCode);
      if (referrer) {
        referredBy = referrer.id;
        bonusCoins = 3; // Bonus coins for being referred

        // Give referrer bonus coins
        await db
          .update(users)
          .set({
            coins: sql`${users.coins} + 5`,
            referralCount: sql`${users.referralCount} + 1`,
          })
          .where(eq(users.id, referrer.id));
      }
    }

    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode,
        referredBy,
        coins: bonusCoins,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUserWithPassword(userData: CreateUserWithPassword): Promise<User> {
    const referralCode = await this.generateUniqueReferralCode();
    let referredBy: string | null = null;
    let bonusCoins = 10;

    // Check if user was referred
    if (userData.referredByCode) {
      const referrer = await this.getUserByReferralCode(userData.referredByCode);
      if (referrer) {
        referredBy = referrer.id;
        bonusCoins = 3; // Bonus coins for being referred

        // Give referrer bonus coins
        await db
          .update(users)
          .set({
            coins: sql`${users.coins} + 5`,
            referralCount: sql`${users.referralCount} + 1`,
          })
          .where(eq(users.id, referrer.id));
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Generate unique user ID based on email
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName || null,
        lastName: userData.lastName || null,
        profileImageUrl: null,
        referralCode,
        referredBy,
        coins: bonusCoins,
      })
      .returning();

    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }


  async updateUserCoins(id: string, coins: number): Promise<void> {
    await db.update(users).set({ coins }).where(eq(users.id, id));
  }

  async deductCoins(id: string, amount: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user || user.coins < amount) {
      return false;
    }
    await this.updateUserCoins(id, user.coins - amount);
    return true;
  }

  async canClaimCoins(id: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;

    const now = new Date();
    const lastClaim = user.lastCoinClaim;

    if (!lastClaim) return true;

    // Check if 24 hours have passed since the FIRST claim of the day
    const hoursSinceLastClaim = (now.getTime() - new Date(lastClaim).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastClaim >= 24;
  }

  private claimCount = new Map<string, { date: string; count: number }>();

  async claimCoin(id: string): Promise<{ success: boolean; coinsRemaining: number; totalCoins: number }> {
    const user = await this.getUser(id);
    if (!user) {
      return { success: false, coinsRemaining: 0, totalCoins: 0 };
    }

    const today = new Date().toDateString();
    const userClaim = this.claimCount.get(id);

    // Check if user already started claiming today
    if (userClaim && userClaim.date === today) {
      // User is continuing to claim coins today
      if (userClaim.count >= 10) {
        return { success: false, coinsRemaining: 0, totalCoins: user.coins };
      }
    } else {
      // New day or first time claiming
      const canClaim = await this.canClaimCoins(id);
      if (!canClaim) {
        return { success: false, coinsRemaining: 0, totalCoins: user.coins };
      }
      // Reset count for new day
      this.claimCount.set(id, { date: today, count: 0 });
    }

    // Add 1 coin
    const newCoins = user.coins + 1;
    const claimData = this.claimCount.get(id)!;
    claimData.count += 1;

    // Only update lastCoinClaim on the FIRST coin of the day
    if (claimData.count === 1) {
      await db.update(users).set({
        coins: newCoins,
        lastCoinClaim: new Date(),
        updatedAt: new Date()
      }).where(eq(users.id, id));
    } else {
      await db.update(users).set({
        coins: newCoins,
        updatedAt: new Date()
      }).where(eq(users.id, id));
    }

    const coinsRemaining = 10 - claimData.count;

    return { success: true, coinsRemaining, totalCoins: newCoins };
  }

  async deleteAllUsers(): Promise<void> {
    await db.delete(users);
    this.claimCount.clear();
  }

  async clearAllSessions(): Promise<void> {
    await db.delete(sessions);
  }
}

export const storage = new DatabaseStorage();