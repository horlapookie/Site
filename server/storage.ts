import User, { type IUser } from "./models/User";
import Transaction from "./models/Transaction";
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
  getUser(id: string): Promise<any | undefined>;
  upsertUser(user: UpsertUser): Promise<any>;
  updateUserCoins(id: string, coins: number): Promise<void>;
  deductCoins(id: string, amount: number): Promise<boolean>;
  addCoins(id: string, amount: number, description: string): Promise<boolean>;
  canClaimCoins(id: string): Promise<boolean>;
  claimCoin(id: string): Promise<{ success: boolean; coinsRemaining: number; totalCoins: number }>;
  deleteAllUsers(): Promise<void>;
  clearAllSessions(): Promise<void>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUserWithPassword(userData: CreateUserWithPassword): Promise<any>;
  verifyPassword(email: string, password: string): Promise<any | null>;
  transferCoins(fromUserId: string, toUserEmail: string, amount: number): Promise<{ success: boolean; message: string }>;
  getTransactions(userId: string, limit?: number): Promise<any[]>;
  updateUserProfile(id: string, updates: { firstName?: string; lastName?: string }): Promise<any | undefined>;
  updateAutoMonitor(id: string, autoMonitor: number): Promise<any | undefined>;
  getUserCount(): Promise<number>;
  getAllUsers(): Promise<any[]>;
  getTaskCompletion(userId: string, taskId: string): Promise<any | null>;
  completeTask(userId: string, taskId: string, metadata?: any): Promise<boolean>;
  getTaskCompletions(userId: string): Promise<any[]>;
  updateTaskMetadata(userId: string, taskId: string, metadata: any): Promise<boolean>;
}

export class MongoStorage implements IStorage {
  private claimCount = new Map<string, { date: string; count: number }>();

  async getUser(id: string): Promise<any | undefined> {
    const user = await User.findById(id).lean() as any as any;
    if (!user) return undefined;
    
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      autoMonitor: user.autoMonitor || 0,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserByReferralCode(referralCode: string): Promise<any | undefined> {
    const user = await User.findOne({ referralCode }).lean() as any as any;
    if (!user) return undefined;
    
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      autoMonitor: user.autoMonitor || 0,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    const user = await User.findOne({ email }).lean() as any as any;
    if (!user) return undefined;
    
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      autoMonitor: user.autoMonitor || 0,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
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

  async upsertUser(userData: UpsertUser & { referredByCode?: string }): Promise<any> {
    const referralCode = await this.generateUniqueReferralCode();
    let referredBy: string | null = null;
    let bonusCoins = 0;

    if (userData.referredByCode) {
      const referrer = await this.getUserByReferralCode(userData.referredByCode);
      if (referrer) {
        referredBy = referrer.id;
        bonusCoins = 3;

        await User.findByIdAndUpdate(referrer.id, {
          $inc: { coins: 5, referralCount: 1 },
        });
      }
    }

    const user = await User.findOneAndUpdate(
      { email: userData.email },
      {
        $setOnInsert: {
          referralCode,
          referredBy,
          coins: bonusCoins,
        },
        $set: {
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
        },
      },
      { upsert: true, new: true }
    ).lean() as any;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async createUserWithPassword(userData: CreateUserWithPassword): Promise<any> {
    const referralCode = await this.generateUniqueReferralCode();
    let referredBy: string | null = null;
    let bonusCoins = 0;

    if (userData.referredByCode) {
      const referrer = await this.getUserByReferralCode(userData.referredByCode);
      if (referrer) {
        referredBy = referrer.id;
        bonusCoins = 3;

        await User.findByIdAndUpdate(referrer.id, {
          $inc: { coins: 5, referralCount: 1 },
        });
      }
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const newUser = await User.create({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: null,
      referralCode,
      referredBy,
      coins: bonusCoins,
    });

    const user = newUser.toObject();
    
    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async verifyPassword(email: string, password: string): Promise<any | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updateUserCoins(id: string, coins: number): Promise<void> {
    await User.findByIdAndUpdate(id, { coins });
  }

  async deductCoins(id: string, amount: number): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user || user.coins < amount) {
      return false;
    }
    const newBalance = user.coins - amount;
    await this.updateUserCoins(id, newBalance);
    
    // Record transaction
    await Transaction.create({
      userId: id,
      type: "deduction",
      amount: -amount,
      description: `Deducted ${amount} coins for bot deployment`,
      balanceAfter: newBalance,
    });
    
    return true;
  }

  async canClaimCoins(id: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;

    const lastClaim = user.lastCoinClaim;
    
    // If never claimed before, they can claim
    if (!lastClaim) return true;

    // Check if last claim was today (same date)
    const lastClaimDate = new Date(lastClaim);
    const todayDate = new Date();
    
    const lastClaimDateStr = lastClaimDate.toDateString();
    const todayDateStr = todayDate.toDateString();
    
    // If the dates are different (different days), user can claim again
    if (lastClaimDateStr !== todayDateStr) {
      return true;
    }

    // If claimed today, check if they've reached 10 coins
    // Count claim transactions for today
    const todayStart = new Date(todayDate);
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date(todayDate);
    todayEnd.setHours(23, 59, 59, 999);

    const todaysClaims = await Transaction.countDocuments({
      userId: id,
      type: "claim",
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // If they've claimed less than 10 today, they can claim more
    return todaysClaims < 10;
  }

  async claimCoin(id: string): Promise<{ success: boolean; coinsRemaining: number; totalCoins: number }> {
    const user = await this.getUser(id);
    if (!user) {
      return { success: false, coinsRemaining: 0, totalCoins: 0 };
    }

    // Check if they can claim
    const canClaim = await this.canClaimCoins(id);
    if (!canClaim) {
      return { success: false, coinsRemaining: 0, totalCoins: user.coins };
    }

    // Count how many coins they've claimed today from transactions
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todaysClaims = await Transaction.countDocuments({
      userId: id,
      type: "claim",
      createdAt: { $gte: todayStart, $lte: todayEnd },
    });

    // Check if they've already claimed 10 coins today
    if (todaysClaims >= 10) {
      return { success: false, coinsRemaining: 0, totalCoins: user.coins };
    }

    const newCoins = user.coins + 1;

    // Update lastCoinClaim on FIRST claim of the day (when count == 1)
    // This ensures the tracking persists even if server restarts
    if (todaysClaims === 0) {
      await User.findByIdAndUpdate(id, {
        coins: newCoins,
        lastCoinClaim: new Date(),
      });
    } else {
      await User.findByIdAndUpdate(id, {
        coins: newCoins,
      });
    }

    // Record transaction
    await Transaction.create({
      userId: id,
      type: "claim",
      amount: 1,
      description: `Claimed 1 coin`,
      balanceAfter: newCoins,
    });

    const coinsRemaining = 10 - (todaysClaims + 1);

    return { success: true, coinsRemaining, totalCoins: newCoins };
  }

  async deleteAllUsers(): Promise<void> {
    await User.deleteMany({});
    this.claimCount.clear();
  }

  async clearAllSessions(): Promise<void> {
    // No sessions to clear with JWT
  }

  async transferCoins(fromUserId: string, toUserEmail: string, amount: number): Promise<{ success: boolean; message: string }> {
    if (amount <= 0) {
      return { success: false, message: "Amount must be greater than 0" };
    }

    const fromUser = await this.getUser(fromUserId);
    if (!fromUser) {
      return { success: false, message: "Sender not found" };
    }

    if (fromUser.coins < amount) {
      return { success: false, message: "Insufficient coins" };
    }

    const toUser = await this.getUserByEmail(toUserEmail);
    if (!toUser) {
      return { success: false, message: "Recipient email not found" };
    }

    if (fromUser.id === toUser.id) {
      return { success: false, message: "Cannot transfer coins to yourself" };
    }

    const newFromBalance = fromUser.coins - amount;
    const newToBalance = toUser.coins + amount;

    await User.findByIdAndUpdate(fromUserId, {
      $inc: { coins: -amount }
    });

    await User.findByIdAndUpdate(toUser.id, {
      $inc: { coins: amount }
    });

    // Record transactions for both users
    await Transaction.create({
      userId: fromUserId,
      type: "transfer_sent",
      amount: -amount,
      description: `Transferred ${amount} coins to ${toUserEmail}`,
      relatedEmail: toUserEmail,
      balanceAfter: newFromBalance,
    });

    await Transaction.create({
      userId: toUser.id,
      type: "transfer_received",
      amount: amount,
      description: `Received ${amount} coins from ${fromUser.email}`,
      relatedEmail: fromUser.email,
      balanceAfter: newToBalance,
    });

    return { success: true, message: `Successfully transferred ${amount} coins to ${toUserEmail}` };
  }

  async getTransactions(userId: string, limit: number = 50): Promise<any[]> {
    const transactions = await Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean() as any;

    return transactions.map((t: any) => ({
      id: t._id.toString(),
      type: t.type,
      amount: t.amount,
      description: t.description,
      relatedEmail: t.relatedEmail,
      balanceAfter: t.balanceAfter,
      createdAt: t.createdAt,
    }));
  }

  async updateUserProfile(id: string, updates: { firstName?: string; lastName?: string }): Promise<any | undefined> {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    ).lean() as any;

    if (!user) return undefined;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      autoMonitor: user.autoMonitor || 0,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async updateAutoMonitor(id: string, autoMonitor: number): Promise<any | undefined> {
    const user = await User.findByIdAndUpdate(
      id,
      { $set: { autoMonitor } },
      { new: true }
    ).lean() as any;

    if (!user) return undefined;

    return {
      id: user._id.toString(),
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      autoMonitor: user.autoMonitor || 0,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserCount(): Promise<number> {
    return await User.countDocuments();
  }

  async getAllUsers(): Promise<any[]> {
    const users = await User.find({}).lean() as any;
    return users.map((user: any) => ({
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      coins: user.coins,
      lastCoinClaim: user.lastCoinClaim,
      referralCode: user.referralCode,
      referredBy: user.referredBy,
      referralCount: user.referralCount,
      autoMonitor: user.autoMonitor || 0,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }

  async addCoins(id: string, amount: number, description: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;
    
    const newBalance = user.coins + amount;
    await this.updateUserCoins(id, newBalance);
    
    await Transaction.create({
      userId: id,
      type: "claim",
      amount,
      description,
      balanceAfter: newBalance,
    });
    
    return true;
  }

  async getTaskCompletion(userId: string, taskId: string): Promise<any | null> {
    const TaskCompletion = (await import("./models/TaskCompletion")).default;
    return await TaskCompletion.findOne({ userId, taskId }).lean() as any;
  }

  async getTaskCompletions(userId: string): Promise<any[]> {
    const TaskCompletion = (await import("./models/TaskCompletion")).default;
    return await TaskCompletion.find({ userId }).lean() as any;
  }

  async completeTask(userId: string, taskId: string, metadata?: any): Promise<boolean> {
    const TaskCompletion = (await import("./models/TaskCompletion")).default;
    
    try {
      await TaskCompletion.create({
        userId,
        taskId,
        metadata: metadata || {},
      });
      return true;
    } catch (error: any) {
      if (error.code === 11000) {
        return false;
      }
      throw error;
    }
  }

  async updateTaskMetadata(userId: string, taskId: string, metadata: any): Promise<boolean> {
    const TaskCompletion = (await import("./models/TaskCompletion")).default;
    const result = await TaskCompletion.findOneAndUpdate(
      { userId, taskId },
      { $set: { metadata, completedAt: new Date() } },
      { new: true }
    );
    return !!result;
  }
}

export const storage = new MongoStorage();
