import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

export async function createPayment(data) {
  const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.userId !== data.userId) throw new AppError("Not authorized", 403);

  const existing = await prisma.payment.findUnique({
    where: { bookingId: data.bookingId },
  });
  if (existing) throw new AppError("Payment already exists for this booking", 409);

  return prisma.payment.create({
    data: {
      id: uuidv4(),
      bookingId: data.bookingId,
      userId: data.userId,
      amount: data.amount,
      method: data.method,
      transactionId: data.transactionId,
      status: "PAID",
      paidAt: new Date(),
    },
  });
}

export async function getPaymentByBookingId(bookingId) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });
  if (!payment) throw new AppError("Payment not found", 404);
  return payment;
}

export async function refundPayment(bookingId) {
  const payment = await prisma.payment.findUnique({
    where: { bookingId },
  });
  if (!payment) throw new AppError("Payment not found", 404);
  if (payment.status !== "PAID") throw new AppError("Payment cannot be refunded", 400);

  return prisma.payment.update({
    where: { bookingId },
    data: { status: "REFUNDED" },
  });
}
