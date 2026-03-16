import jwt from "jsonwebtoken";
import BakeryOwner from "../models/BakeryOwner.js";
import { env } from "../config/env.js";

export const requireBakeryOwnerAuth = async (req, res, next) => {
  try {
    const rawHeader = req.headers.authorization || "";
    const token = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : "";

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: missing token" });
    }

    const payload = jwt.verify(token, env.jwtSecret);
    if (payload?.type !== "bakery_owner") {
      return res.status(401).json({ message: "Unauthorized: invalid token" });
    }

    const owner = await BakeryOwner.findById(payload.sub).select("-password");
    if (!owner) {
      return res.status(401).json({ message: "Unauthorized: owner not found" });
    }

    req.bakeryOwner = owner;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};
