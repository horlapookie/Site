import { connectDB } from "../server/mongodb";
import User from "../server/models/User";
import bcrypt from "bcryptjs";

const ADMIN_EMAIL = "olamilekanidowu998@gmail.com";
const ADMIN_PASSWORD = "omotoyosi";
const ADMIN_COINS = 999999;

async function setupAdmin() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Check if admin user already exists
    let adminUser = await User.findOne({ email: ADMIN_EMAIL });

    if (adminUser) {
      console.log("Admin user already exists, updating coins...");
      await User.findByIdAndUpdate(adminUser._id, {
        coins: ADMIN_COINS,
      });
      console.log(`Admin user coins updated to ${ADMIN_COINS}`);
    } else {
      console.log("Creating admin user...");
      const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
      
      adminUser = await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        coins: ADMIN_COINS,
        referralCode: "ADMIN",
      });
      
      console.log("Admin user created successfully!");
    }

    console.log("\nAdmin Account Details:");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("Coins:", ADMIN_COINS);
    console.log("\nAdmin setup complete!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error setting up admin:", error);
    process.exit(1);
  }
}

setupAdmin();
