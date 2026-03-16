import { loginBakeryOwnerAccount, registerBakeryOwnerAccount } from "../services/bakeryOwnerService.js";
import { sendSuccess } from "../utils/response.js";

export const registerBakeryOwner = async (req, res, next) => {
  try {
    const result = await registerBakeryOwnerAccount(req.body);
    return sendSuccess(res, result, "Bakery owner registered", 201);
  } catch (error) {
    return next(error);
  }
};

export const loginBakeryOwner = async (req, res, next) => {
  try {
    const result = await loginBakeryOwnerAccount(req.body);
    return sendSuccess(res, result, "Bakery owner login successful");
  } catch (error) {
    return next(error);
  }
};

export const getBakeryOwnerProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, { owner: req.bakeryOwner }, "Bakery owner profile");
  } catch (error) {
    return next(error);
  }
};
