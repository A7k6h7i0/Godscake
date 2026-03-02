import { Router } from "express";
import { param } from "express-validator";
import { getBakeryCakes } from "../controllers/cakeController.js";
import { validate } from "../middlewares/validateMiddleware.js";

const router = Router();

router.get(
  "/bakeries/:id/cakes",
  [param("id").isMongoId().withMessage("Invalid bakery id")],
  validate,
  getBakeryCakes
);

export default router;
