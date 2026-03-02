import { Router } from "express";
import { body, param, query } from "express-validator";
import {
  acceptOrderForPartnerController,
  createOrderController,
  getOrderController,
  listAvailableOrdersForPartnerController,
  listOrdersController,
  updateDeliveryStatusForPartnerController,
  updateOrderStatusController,
} from "../controllers/orderController.js";
import { requireAuth, requireRole } from "../middlewares/authMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = Router();

router.get(
  "/",
  requireAuth,
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["Placed", "Accepted", "Preparing", "Out for Delivery", "Delivered"])
      .withMessage("Invalid status"),
  ],
  validate,
  listOrdersController
);

router.get(
  "/delivery/available",
  requireAuth,
  requireRole(["partner"]),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
  ],
  validate,
  listAvailableOrdersForPartnerController
);

router.get(
  "/delivery/my",
  requireAuth,
  requireRole(["partner"]),
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("status")
      .optional()
      .isIn(["Accepted", "Preparing", "Out for Delivery", "Delivered"])
      .withMessage("Invalid status"),
  ],
  validate,
  listOrdersController
);

router.post(
  "/",
  requireAuth,
  [
    body("bakeryId").isMongoId().withMessage("bakeryId is required"),
    body("deliveryAddress").trim().notEmpty().withMessage("deliveryAddress is required"),
    body("deliveryLat").optional().isFloat({ min: -90, max: 90 }),
    body("deliveryLng").optional().isFloat({ min: -180, max: 180 }),
    body("items").isArray({ min: 1 }).withMessage("items must be a non-empty array"),
    body("items.*.cakeId").isMongoId().withMessage("cakeId must be valid"),
    body("items.*.quantity").isInt({ min: 1 }).withMessage("quantity must be >= 1"),
    body("recipientName").optional().isString(),
    body("recipientPhone").optional().isString(),
  ],
  validate,
  createOrderController
);

router.get("/:id", requireAuth, [param("id").isMongoId().withMessage("Invalid order id")], validate, getOrderController);

router.post(
  "/:id/delivery/accept",
  requireAuth,
  requireRole(["partner"]),
  [param("id").isMongoId().withMessage("Invalid order id")],
  validate,
  acceptOrderForPartnerController
);

router.patch(
  "/:id/delivery/status",
  requireAuth,
  requireRole(["partner"]),
  [
    param("id").isMongoId().withMessage("Invalid order id"),
    body("status").isIn(["Out for Delivery", "Delivered"]).withMessage("Invalid delivery status"),
    body("note").optional().isString(),
  ],
  validate,
  updateDeliveryStatusForPartnerController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin"]),
  [
    param("id").isMongoId().withMessage("Invalid order id"),
    body("status")
      .isIn(["Accepted", "Preparing", "Out for Delivery", "Delivered"])
      .withMessage("Invalid status"),
    body("note").optional().isString(),
  ],
  validate,
  updateOrderStatusController
);

export default router;
