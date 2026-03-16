import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  getBakeryOwnerProfile,
  loginBakeryOwner,
  registerBakeryOwner,
} from "../controllers/bakeryOwnerAuthController.js";
import {
  claimOwnerBakery,
  createOwnerBakery,
  getOwnerBakery,
  updateOwnerBakery,
} from "../controllers/bakeryOwnerController.js";
import {
  createOwnerMenuItem,
  deleteOwnerMenuItem,
  listOwnerMenuItems,
  updateOwnerMenuItem,
} from "../controllers/menuItemController.js";
import { listBakeryOwnerOrders, updateBakeryOwnerOrderStatus } from "../controllers/bakeryOwnerOrderController.js";
import { requireBakeryOwnerAuth } from "../middlewares/bakeryOwnerAuthMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
    body("phone").optional().isString(),
  ],
  validate,
  registerBakeryOwner
);

router.post(
  "/login",
  [body("email").isEmail().withMessage("Valid email is required"), body("password").notEmpty()],
  validate,
  loginBakeryOwner
);

router.get("/me", requireBakeryOwnerAuth, getBakeryOwnerProfile);

router.get("/bakery", requireBakeryOwnerAuth, getOwnerBakery);

router.post(
  "/bakery",
  requireBakeryOwnerAuth,
  [
    body("name").trim().notEmpty().withMessage("Bakery name is required"),
    body("address").trim().notEmpty().withMessage("Bakery address is required"),
    body("contactEmail").optional().isEmail(),
    body("contactPhone").optional().isString(),
    body("opensAt").optional().isString(),
    body("closesAt").optional().isString(),
    body("daysOpen").optional().isArray(),
    body("images").optional().isArray(),
    body("coverImage").optional().isString(),
    body("lat").optional().isFloat({ min: -90, max: 90 }),
    body("lng").optional().isFloat({ min: -180, max: 180 }),
  ],
  validate,
  createOwnerBakery
);

router.patch(
  "/bakery",
  requireBakeryOwnerAuth,
  [
    body("name").optional().isString(),
    body("address").optional().isString(),
    body("contactEmail").optional().isEmail(),
    body("contactPhone").optional().isString(),
    body("opensAt").optional().isString(),
    body("closesAt").optional().isString(),
    body("daysOpen").optional().isArray(),
    body("images").optional().isArray(),
    body("coverImage").optional().isString(),
    body("lat").optional().isFloat({ min: -90, max: 90 }),
    body("lng").optional().isFloat({ min: -180, max: 180 }),
  ],
  validate,
  updateOwnerBakery
);

router.post(
  "/bakery/claim",
  requireBakeryOwnerAuth,
  [body("bakeryId").isMongoId().withMessage("bakeryId is required")],
  validate,
  claimOwnerBakery
);

router.get("/menu-items", requireBakeryOwnerAuth, listOwnerMenuItems);

router.post(
  "/menu-items",
  requireBakeryOwnerAuth,
  [
    body("name").trim().notEmpty().withMessage("Menu item name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0"),
    body("description").optional().isString(),
    body("category").optional().isString(),
    body("imageUrls").optional().isArray(),
    body("isAvailable").optional().isBoolean(),
  ],
  validate,
  createOwnerMenuItem
);

router.patch(
  "/menu-items/:id",
  requireBakeryOwnerAuth,
  [
    param("id").isMongoId().withMessage("Invalid menu item id"),
    body("name").optional().isString(),
    body("price").optional().isFloat({ min: 0 }),
    body("description").optional().isString(),
    body("category").optional().isString(),
    body("imageUrls").optional().isArray(),
    body("isAvailable").optional().isBoolean(),
  ],
  validate,
  updateOwnerMenuItem
);

router.delete(
  "/menu-items/:id",
  requireBakeryOwnerAuth,
  [param("id").isMongoId().withMessage("Invalid menu item id")],
  validate,
  deleteOwnerMenuItem
);

router.get(
  "/orders",
  requireBakeryOwnerAuth,
  [
    query("status")
      .optional()
      .isIn(["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"])
      .withMessage("Invalid status"),
  ],
  validate,
  listBakeryOwnerOrders
);

router.patch(
  "/orders/:id/status",
  requireBakeryOwnerAuth,
  [
    param("id").isMongoId().withMessage("Invalid order id"),
    body("status")
      .isIn(["Accepted", "Preparing"])
      .withMessage("Bakery owners can only set status to Accepted or Preparing"),
    body("note").optional().isString(),
  ],
  validate,
  updateBakeryOwnerOrderStatus
);

export default router;
