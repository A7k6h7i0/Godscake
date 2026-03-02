import mongoose from "mongoose";
import { connectDb } from "../src/config/db.js";
import User from "../src/models/User.js";

const requiredEnv = ["PARTNER_NAME", "PARTNER_EMAIL", "PARTNER_PASSWORD"];

const assertEnv = () => {
  const missing = requiredEnv.filter((key) => !process.env[key] || !process.env[key].trim());
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(", ")}`);
  }
};

const run = async () => {
  assertEnv();
  await connectDb();

  const partnerName = process.env.PARTNER_NAME.trim();
  const partnerEmail = process.env.PARTNER_EMAIL.trim().toLowerCase();
  const partnerPassword = process.env.PARTNER_PASSWORD;
  const forceReset = process.env.PARTNER_FORCE_RESET_PASSWORD === "true";

  let user = await User.findOne({ email: partnerEmail }).select("+password");

  if (!user) {
    user = await User.create({
      name: partnerName,
      email: partnerEmail,
      password: partnerPassword,
      role: "partner",
    });
    console.log(`Delivery partner created: ${partnerEmail}`);
  } else {
    user.name = partnerName;
    user.role = "partner";
    if (forceReset) {
      user.password = partnerPassword;
    }
    await user.save();
    console.log(`User promoted/updated as delivery partner: ${partnerEmail}`);
    if (forceReset) {
      console.log("Partner password reset was applied.");
    } else {
      console.log("Partner password unchanged. Set PARTNER_FORCE_RESET_PASSWORD=true to rotate.");
    }
  }

  await mongoose.connection.close();
};

run().catch(async (error) => {
  console.error("Failed to bootstrap delivery partner:", error.message);
  await mongoose.connection.close();
  process.exit(1);
});
