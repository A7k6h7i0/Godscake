import { Router } from "express";
import { query, param } from "express-validator";
import { geocodeAddressController, getBakery, getBakeries, getNearbyBakeries } from "../controllers/bakeryController.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = Router();

router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("search").optional().isString(),
    query("min_rating").optional().isFloat({ min: 0, max: 5 }).withMessage("min_rating must be 0-5"),
    query("category").optional().isString(),
  ],
  validate,
  getBakeries
);

router.get(
  "/geocode",
  [query("address").trim().notEmpty().withMessage("address query is required")],
  validate,
  geocodeAddressController
);

router.get(
  "/nearby",
  [
    query("lat").optional().isFloat({ min: -90, max: 90 }).withMessage("lat is invalid"),
    query("lng").optional().isFloat({ min: -180, max: 180 }).withMessage("lng is invalid"),
    query("latitude").optional().isFloat({ min: -90, max: 90 }).withMessage("latitude is invalid"),
    query("longitude").optional().isFloat({ min: -180, max: 180 }).withMessage("longitude is invalid"),
    query("radius").optional().isFloat({ gt: 0 }).withMessage("radius must be > 0"),
    query("radiusKm").optional().isFloat({ gt: 0 }).withMessage("radiusKm must be > 0"),
    query("page").optional().isInt({ min: 1 }).withMessage("page must be >= 1"),
    query("limit").optional().isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
    query("category").optional().isString(),
  ],
  validate,
  getNearbyBakeries
);

router.get("/:id", [param("id").isMongoId().withMessage("Invalid bakery id")], validate, getBakery);

export default router;
