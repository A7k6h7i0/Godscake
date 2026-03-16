import { loginUser, registerBakeryOwner, registerUser } from "../services/authService.js";
import { sendSuccess } from "../utils/response.js";

export const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);
    return sendSuccess(res, result, "User registered", 201);
  } catch (error) {
    return next(error);
  }
};

export const registerBakery = async (req, res, next) => {
  try {
    const { name, email, password, bakeryName, bakeryAddress, bakeryPhone } = req.body;
    const result = await registerBakeryOwner({ name, email, password, bakeryName, bakeryAddress, bakeryPhone });
    return sendSuccess(res, result, "Bakery owner registered successfully", 201);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    return sendSuccess(res, result, "Login successful");
  } catch (error) {
    return next(error);
  }
};
