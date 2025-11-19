
import mongoose from "mongoose";
import User from "../server/models/User";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/eclipse-md";

async function setAdminStatus(email: string, isAdmin: boolean) {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`User with email ${email} not found`);
      process.exit(1);
    }

    user.isAdmin = isAdmin;
    await user.save();

    console.log(`Successfully set admin status to ${isAdmin} for ${email}`);
    process.exit(0);
  } catch (error) {
    console.error("Error setting admin status:", error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
const isAdmin = process.argv[3] === "true";

if (!email) {
  console.log("Usage: tsx scripts/set-admin.ts <email> <true|false>");
  process.exit(1);
}

setAdminStatus(email, isAdmin);
