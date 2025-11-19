import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  type: "claim" | "transfer_sent" | "transfer_received" | "deduction" | "refund" | "referral_bonus";
  amount: number;
  description: string;
  relatedEmail?: string;
  balanceAfter: number;
  createdAt: Date;
}

const TransactionSchema = new Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  type: {
    type: String,
    required: true,
    enum: ["claim", "transfer_sent", "transfer_received", "deduction", "refund", "referral_bonus"],
  },
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  relatedEmail: {
    type: String,
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
