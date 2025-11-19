import User, { type IUser } from "./models/User";
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
  canClaimCoins(id: string): Promise<boolean>;
  claimCoin(id: string): Promise<{ success: boolean; coinsRemaining: number; totalCoins: number }>;
  deleteAllUsers(): Promise<void>;
  clearAllSessions(): Promise<void>;
  getUserByEmail(email: string): Promise<any | undefined>;
  createUserWithPassword(userData: CreateUserWithPassword): Promise<any>;
  verifyPassword(email: string, password: string): Promise<any | null>;
}

export class MongoStorage implements IStorage {
  private claimCount = new Map<string, { date: string; count: number }>();

  async getUser(id: string): Promise<any | undefined> {
    const user = await User.findById(id).lean();
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserByReferralCode(referralCode: string): Promise<any | undefined> {
    const user = await User.findOne({ referralCode }).lean();
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
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async getUserByEmail(email: string): Promise<any | undefined> {
    const user = await User.findOne({ email }).lean();
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
        bonusCoins = 0;

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
    ).lean();

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
        bonusCoins = 0;

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
    await this.updateUserCoins(id, user.coins - amount);
    return true;
  }

  async canClaimCoins(id: string): Promise<boolean> {
    const user = await this.getUser(id);
    if (!user) return false;

    const now = new Date();
    const lastClaim = user.lastCoinClaim;

    if (!lastClaim) return true;

    const hoursSinceLastClaim = (now.getTime() - new Date(lastClaim).getTime()) / (1000 * 60 * 60);
    return hoursSinceLastClaim >= 24;
  }

  async claimCoin(id: string): Promise<{ success: boolean; coinsRemaining: number; totalCoins: number }> {
    const user = await this.getUser(id);
    if (!user) {
      return { success: false, coinsRemaining: 0, totalCoins: 0 };
    }

    const today = new Date().toDateString();
    const userClaim = this.claimCount.get(id);

    if (userClaim && userClaim.date === today) {
      if (userClaim.count >= 10) {
        return { success: false, coinsRemaining: 0, totalCoins: user.coins };
      }
    } else {
      const canClaim = await this.canClaimCoins(id);
      if (!canClaim) {
        return { success: false, coinsRemaining: 0, totalCoins: user.coins };
      }
      this.claimCount.set(id, { date: today, count: 0 });
    }

    const newCoins = user.coins + 1;
    const claimData = this.claimCount.get(id)!;
    claimData.count += 1;

    if (claimData.count === 1) {
      await User.findByIdAndUpdate(id, {
        coins: newCoins,
        lastCoinClaim: new Date(),
      });
    } else {
      await User.findByIdAndUpdate(id, {
        coins: newCoins,
      });
    }

    const coinsRemaining = 10 - claimData.count;

    return { success: true, coinsRemaining, totalCoins: newCoins };
  }

  async deleteAllUsers(): Promise<void> {
    await User.deleteMany({});
    this.claimCount.clear();
  }

  async clearAllSessions(): Promise<void> {
    // No sessions to clear with JWT
  }
}

export const storage = new MongoStorage();
