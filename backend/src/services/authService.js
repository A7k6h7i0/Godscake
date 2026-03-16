import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Bakery from "../models/Bakery.js";
import { env } from "../config/env.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const buildToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const registerUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new ApiError(409, "Email already registered");

  const user = await User.create({ name, email, password, role: "user" });
  const token = buildToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const token = buildToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};

// ===== Bakery Owner Registration =====

export const registerBakeryOwner = async ({ name, email, password, bakeryName, bakeryAddress, bakeryPhone }) => {
  // Check if email already exists
  const existing = await User.findOne({ email: email.toLowerCase() }).select("+password");
  if (existing) {
    if (existing.role !== "user") {
      throw new ApiError(409, "Email already registered");
    }

    const ok = await existing.comparePassword(password);
    if (!ok) throw new ApiError(401, "Invalid credentials");

    const bakery = await Bakery.create({
      name: bakeryName,
      address: bakeryAddress,
      phone: bakeryPhone || "",
      location: { type: "Point", coordinates: [0, 0] }, // Default location, can be updated later
    });

    existing.role = "bakery";
    existing.bakeryId = bakery._id;
    if (name && name.trim()) {
      existing.name = name.trim();
    }
    await existing.save();

    bakery.ownerId = existing._id;
    await bakery.save();

    const token = buildToken(existing);
    return {
      token,
      user: { id: existing._id, name: existing.name, email: existing.email, role: existing.role },
    };
  }

  // Create the bakery first
  const bakery = await Bakery.create({
    name: bakeryName,
    address: bakeryAddress,
    phone: bakeryPhone || "",
    location: { type: "Point", coordinates: [0, 0] }, // Default location, can be updated later
  });

  // Create the user with role "bakery" and link to the bakery
  const user = await User.create({
    name,
    email,
    password,
    role: "bakery",
    bakeryId: bakery._id,
  });

  // Update bakery with ownerId
  bakery.ownerId = user._id;
  await bakery.save();

  const token = buildToken(user);
  return { token, user: { id: user._id, name: user.name, email: user.email, role: user.role } };
};
