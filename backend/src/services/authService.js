import jwt from "jsonwebtoken";
import User from "../models/User.js";
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
