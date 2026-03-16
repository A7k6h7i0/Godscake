import {
  createMenuItemForOwner,
  deleteMenuItemForOwner,
  listMenuItemsForBakery,
  listMenuItemsForOwner,
  updateMenuItemForOwner,
} from "../services/menuItemService.js";
import { sendSuccess } from "../utils/response.js";

export const listOwnerMenuItems = async (req, res, next) => {
  try {
    const items = await listMenuItemsForOwner(req.bakeryOwner);
    return sendSuccess(res, items, "Menu items");
  } catch (error) {
    return next(error);
  }
};

export const createOwnerMenuItem = async (req, res, next) => {
  try {
    const item = await createMenuItemForOwner(req.bakeryOwner, req.body);
    return sendSuccess(res, item, "Menu item created", 201);
  } catch (error) {
    return next(error);
  }
};

export const updateOwnerMenuItem = async (req, res, next) => {
  try {
    const item = await updateMenuItemForOwner(req.bakeryOwner, req.params.id, req.body);
    return sendSuccess(res, item, "Menu item updated");
  } catch (error) {
    return next(error);
  }
};

export const deleteOwnerMenuItem = async (req, res, next) => {
  try {
    const item = await deleteMenuItemForOwner(req.bakeryOwner, req.params.id);
    return sendSuccess(res, item, "Menu item deleted");
  } catch (error) {
    return next(error);
  }
};

export const listBakeryMenuItems = async (req, res, next) => {
  try {
    const items = await listMenuItemsForBakery(req.params.id);
    return sendSuccess(res, items, "Menu items");
  } catch (error) {
    return next(error);
  }
};
