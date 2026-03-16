import { Router } from "express";
import { body } from "express-validator";
import { login, register, registerBakery } from "../controllers/authController.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  validate,
  register
);

router.post(
  "/register/bakery",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("bakeryName").trim().notEmpty().withMessage("Bakery name is required"),
    body("bakeryAddress").trim().notEmpty().withMessage("Bakery address is required"),
    body("bakeryPhone").optional().isString(),
  ],
  validate,
  registerBakery
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty()],
  validate,
  login
);

export default router;
