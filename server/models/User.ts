import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  coins: number;
  lastCoinClaim?: Date;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    firstName: { type: String },
    lastName: { type: String },
    profileImageUrl: { type: String },
    coins: { type: Number, default: 10, required: true },
    lastCoinClaim: { type: Date },
    referralCode: { type: String, unique: true, required: true },
    referredBy: { type: String },
    referralCount: { type: Number, default: 0, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
