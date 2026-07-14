import { Router } from "express";
import { body } from "express-validator";
import * as paymentController from "../controllers/paymentController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  validate([
    body("bookingId").notEmpty().withMessage("Booking ID required"),
    body("amount").isFloat({ min: 0 }).withMessage("Valid amount required"),
    body("method")
      .isIn(["CARD", "CASH", "MOBILE_MONEY"])
      .withMessage("Invalid payment method"),
  ]),
  paymentController.createPayment
);

router.get("/:bookingId", paymentController.getPaymentByBookingId);
router.post("/:bookingId/refund", authorize("ADMIN"), paymentController.refundPayment);

export default router;
