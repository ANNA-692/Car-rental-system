import { Router } from "express";
import { body } from "express-validator";
import * as bookingController from "../controllers/bookingController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate([
    body("carId").notEmpty().withMessage("Car ID required"),
    body("startDate").isISO8601().withMessage("Valid start date required"),
    body("endDate").isISO8601().withMessage("Valid end date required"),
  ]),
  bookingController.createBooking
);

router.get("/", bookingController.getUserBookings);
router.get("/all", authorize("ADMIN"), bookingController.getAllBookings);
router.get("/:id", bookingController.getBookingById);

router.patch(
  "/:id/status",
  authorize("ADMIN"),
  validate([
    body("status")
      .isIn(["CONFIRMED", "ACTIVE", "COMPLETED", "CANCELLED"])
      .withMessage("Invalid status"),
    body("mileage")
      .optional({ values: "null" })
      .isInt({ min: 0 })
      .withMessage("Mileage must be a positive integer"),
  ]),
  bookingController.updateBookingStatus
);

router.post("/:id/cancel", bookingController.cancelBooking);

export default router;
