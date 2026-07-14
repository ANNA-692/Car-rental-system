import { Router } from "express";
import { body } from "express-validator";
import * as reviewController from "../controllers/reviewController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.get("/car/:carId", reviewController.getCarReviews);

router.use(authenticate);

router.post(
  "/",
  validate([
    body("carId").notEmpty().withMessage("Car ID required"),
    body("bookingId").notEmpty().withMessage("Booking ID required"),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be 1-5"),
  ]),
  reviewController.createReview
);

router.get("/my", reviewController.getUserReviews);
router.delete("/:id", reviewController.deleteReview);

export default router;
