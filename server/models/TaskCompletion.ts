import mongoose, { Schema, Document } from "mongoose";

export interface ITaskCompletion extends Document {
  userId: string;
  taskId: string;
  completedAt: Date;
  metadata?: {
    adsWatchedToday?: number;
    lastAdWatchDate?: string;
  };
}

const TaskCompletionSchema = new Schema<ITaskCompletion>(
  {
    userId: { type: String, required: true, index: true },
    taskId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    metadata: {
      adsWatchedToday: { type: Number, default: 0 },
      lastAdWatchDate: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

TaskCompletionSchema.index({ userId: 1, taskId: 1 }, { unique: true });

export default mongoose.models.TaskCompletion || mongoose.model<ITaskCompletion>("TaskCompletion", TaskCompletionSchema);
