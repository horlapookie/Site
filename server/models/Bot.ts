
import mongoose, { Schema, Document } from "mongoose";

export interface IBot extends Document {
  userId: string;
  herokuAppName: string;
  botNumber: string;
  sessionData: string;
  prefix: string;
  openaiKey?: string;
  geminiKey?: string;
  autoViewMessage: boolean;
  autoViewStatus: boolean;
  autoReactStatus: boolean;
  autoReact: boolean;
  autoTyping: boolean;
  autoRecording: boolean;
  status: "running" | "stopped" | "deploying" | "failed";
  herokuAppId?: string;
  deployedAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BotSchema = new Schema<IBot>(
  {
    userId: { type: String, required: true, index: true },
    herokuAppName: { type: String, required: true, unique: true },
    botNumber: { type: String, required: true },
    sessionData: { type: String, required: true },
    prefix: { type: String, default: "." },
    openaiKey: { type: String },
    geminiKey: { type: String },
    autoViewMessage: { type: Boolean, default: false },
    autoViewStatus: { type: Boolean, default: false },
    autoReactStatus: { type: Boolean, default: false },
    autoReact: { type: Boolean, default: false },
    autoTyping: { type: Boolean, default: false },
    autoRecording: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["running", "stopped", "deploying", "failed"],
      default: "deploying",
    },
    herokuAppId: { type: String },
    deployedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

// Remove any old indexes that might exist
BotSchema.index({ containerName: 1 }, { sparse: true });

export default mongoose.models.Bot || mongoose.model<IBot>("Bot", BotSchema);
