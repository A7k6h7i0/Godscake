import Cake from "../models/Cake.js";
import { ApiError } from "../middlewares/errorMiddleware.js";
import { cakeCatalog } from "../config/cakeCatalog.js";

export const getCakesByBakeryId = async (bakeryId) => {
  const existing = await Cake.find({ bakeryId });
  const existingNameSet = new Set(existing.map((cake) => cake.name.trim().toLowerCase()));

  const missingCakes = cakeCatalog.filter((cake) => !existingNameSet.has(cake.name.trim().toLowerCase()));
  if (missingCakes.length > 0) {
    await Cake.insertMany(missingCakes.map((cake) => ({ ...cake, bakeryId, isAvailable: true })));
  }

  return Cake.find({ bakeryId, isAvailable: true }).sort({ price: 1, name: 1 });
};

export const getCakeById = async (cakeId) => {
  const cake = await Cake.findById(cakeId);
  if (!cake) throw new ApiError(404, "Cake not found");
  return cake;
};
