import {
  claimExistingBakery,
  createBakeryProfile,
  getBakeryForOwner,
  updateBakeryProfile,
} from "../services/bakeryManagementService.js";
import { sendSuccess } from "../utils/response.js";

export const getOwnerBakery = async (req, res, next) => {
  try {
    const bakery = await getBakeryForOwner(req.bakeryOwner);
    return sendSuccess(res, bakery, "Bakery profile");
  } catch (error) {
    return next(error);
  }
};

export const createOwnerBakery = async (req, res, next) => {
  try {
    const bakery = await createBakeryProfile(req.bakeryOwner, req.body);
    return sendSuccess(res, bakery, "Bakery profile created", 201);
  } catch (error) {
    return next(error);
  }
};

export const updateOwnerBakery = async (req, res, next) => {
  try {
    const bakery = await updateBakeryProfile(req.bakeryOwner, req.body);
    return sendSuccess(res, bakery, "Bakery profile updated");
  } catch (error) {
    return next(error);
  }
};

export const claimOwnerBakery = async (req, res, next) => {
  try {
    const bakery = await claimExistingBakery(req.bakeryOwner, req.body.bakeryId, {
      force: Boolean(req.body.force),
    });
    return sendSuccess(res, bakery, "Bakery claimed successfully");
  } catch (error) {
    return next(error);
  }
};
