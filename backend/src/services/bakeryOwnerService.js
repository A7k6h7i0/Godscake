import jwt from "jsonwebtoken";
import BakeryOwner from "../models/BakeryOwner.js";
import { env } from "../config/env.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

const buildOwnerToken = (owner) =>
  jwt.sign({ sub: owner._id.toString(), type: "bakery_owner" }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const registerBakeryOwnerAccount = async ({ name, email, password, phone }) => {
  const existing = await BakeryOwner.findOne({ email: email.toLowerCase() }).select("+password");
  if (existing) throw new ApiError(409, "Email already registered");

  const owner = await BakeryOwner.create({ name, email, password, phone: phone || "" });
  const token = buildOwnerToken(owner);

  return {
    token,
    owner: { id: owner._id, name: owner.name, email: owner.email, phone: owner.phone },
  };
};

export const loginBakeryOwnerAccount = async ({ email, password }) => {
  const owner = await BakeryOwner.findOne({ email: email.toLowerCase() }).select("+password");
  if (!owner) throw new ApiError(401, "Invalid credentials");

  const ok = await owner.comparePassword(password);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  owner.lastLoginAt = new Date();
  await owner.save();

  const token = buildOwnerToken(owner);
  return {
    token,
    owner: { id: owner._id, name: owner.name, email: owner.email, phone: owner.phone, bakeryId: owner.bakeryId },
  };
};
