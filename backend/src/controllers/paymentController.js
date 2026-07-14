import * as paymentService from "../services/paymentService.js";
import { logAction } from "../services/auditLogService.js";

export async function createPayment(req, res, next) {
  try {
    const payment = await paymentService.createPayment({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json({ status: "success", data: payment });
  } catch (err) {
    next(err);
  }
}

export async function getPaymentByBookingId(req, res, next) {
  try {
    const payment = await paymentService.getPaymentByBookingId(req.params.bookingId);
    res.json({ status: "success", data: payment });
  } catch (err) {
    next(err);
  }
}

export async function refundPayment(req, res, next) {
  try {
    const payment = await paymentService.refundPayment(req.params.bookingId);
    await logAction(req.user.userId, "REFUND_PAYMENT", "Payment", payment.id, { bookingId: req.params.bookingId });
    res.json({ status: "success", data: payment });
  } catch (err) {
    next(err);
  }
}
