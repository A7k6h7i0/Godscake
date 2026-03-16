import MenuItem from "../models/MenuItem.js";
import { getBakeryForOwner } from "./bakeryManagementService.js";
import { ApiError } from "../middlewares/errorMiddleware.js";

export const listMenuItemsForOwner = async (owner) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");
  return MenuItem.find({ bakeryId: bakery._id }).sort({ createdAt: -1 });
};

export const createMenuItemForOwner = async (owner, payload) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");

  return MenuItem.create({
    bakeryId: bakery._id,
    name: payload.name,
    description: payload.description || "",
    category: payload.category || "",
    price: payload.price,
    imageUrls: Array.isArray(payload.imageUrls) ? payload.imageUrls : [],
    isAvailable: payload.isAvailable !== undefined ? payload.isAvailable : true,
  });
};

export const updateMenuItemForOwner = async (owner, menuItemId, payload) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");

  const menuItem = await MenuItem.findOne({ _id: menuItemId, bakeryId: bakery._id });
  if (!menuItem) throw new ApiError(404, "Menu item not found");

  if (payload.name !== undefined) menuItem.name = payload.name;
  if (payload.description !== undefined) menuItem.description = payload.description || "";
  if (payload.category !== undefined) menuItem.category = payload.category || "";
  if (payload.price !== undefined) menuItem.price = payload.price;
  if (payload.imageUrls !== undefined) menuItem.imageUrls = Array.isArray(payload.imageUrls) ? payload.imageUrls : [];
  if (payload.isAvailable !== undefined) menuItem.isAvailable = Boolean(payload.isAvailable);

  await menuItem.save();
  return menuItem;
};

export const deleteMenuItemForOwner = async (owner, menuItemId) => {
  const bakery = await getBakeryForOwner(owner);
  if (!bakery) throw new ApiError(404, "Bakery profile not found");

  const menuItem = await MenuItem.findOneAndDelete({ _id: menuItemId, bakeryId: bakery._id });
  if (!menuItem) throw new ApiError(404, "Menu item not found");
  return menuItem;
};

export const listMenuItemsForBakery = async (bakeryId) => {
  return MenuItem.find({ bakeryId, isAvailable: true }).sort({ createdAt: -1 });
};
