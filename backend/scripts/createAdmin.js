import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import { env } from "../src/config/env.js";
import User from "../src/models/User.js";

const requiredEnv = ["ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];

const assertEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key] || !process.env[key].trim());
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
};

const run = async () => {
  assertEnv();
  await connectDb();

  const adminName = process.env.ADMIN_NAME.trim();
  const adminEmail = process.env.ADMIN_EMAIL.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;
  const forceReset = process.env.ADMIN_FORCE_RESET_PASSWORD === "true";

  let user = await User.findOne({ email: adminEmail }).select("+password");

  if (!user) {
    user = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
    });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    user.name = adminName;
    user.role = "admin";
    if (forceReset) {
      user.password = adminPassword;
    }
    await user.save();
    console.log(`User promoted/updated as admin: ${adminEmail}`);
    if (forceReset) {
      console.log("Admin password reset was applied.");
    } else {
      console.log("Admin password unchanged. Set ADMIN_FORCE_RESET_PASSWORD=true to rotate.");
    }
  }

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Failed to bootstrap admin:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
