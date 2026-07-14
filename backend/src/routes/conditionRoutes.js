import { Router } from "express";
import { body } from "express-validator";
import * as conditionController from "../controllers/conditionController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { upload } from "../config/upload.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.post(
  "/:carId/images",
  authorize("ADMIN", "STAFF"),
  upload.single("image"),
  conditionController.uploadImage
);

router.get("/:carId/images", conditionController.listImages);

router.delete("/images/:id", authorize("ADMIN"), conditionController.deleteImage);

router.post(
  "/:carId/compare",
  authorize("ADMIN", "STAFF"),
  validate([
    body("baselineImageId").notEmpty().withMessage("Baseline image ID required"),
    body("comparisonImageId").notEmpty().withMessage("Comparison image ID required"),
  ]),
  conditionController.compare
);

router.get("/:carId/reports", conditionController.listReports);

router.put(
  "/reports/:id/review",
  authorize("ADMIN"),
  validate([
    body("status").isIn(["PENDING", "REVIEWED", "RESOLVED"]).withMessage("Invalid status"),
  ]),
  conditionController.reviewReport
);

export default router;
