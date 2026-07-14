import * as bookingService from "../services/bookingService.js";
import { logAction } from "../services/auditLogService.js";

export async function createBooking(req, res, next) {
  try {
    const booking = await bookingService.createBooking({
      ...req.body,
      userId: req.user.userId,
    });
    res.status(201).json({ status: "success", data: booking });
  } catch (err) {
    next(err);
  }
}

export async function getUserBookings(req, res, next) {
  try {
    const result = await bookingService.getUserBookings(req.user.userId, req.query);
    res.json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
}

export async function getAllBookings(req, res, next) {
  try {
    const result = await bookingService.getAllBookings(req.query);
    res.json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
}

export async function getBookingById(req, res, next) {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    res.json({ status: "success", data: booking });
  } catch (err) {
    next(err);
  }
}

export async function updateBookingStatus(req, res, next) {
  try {
    const { status, mileage } = req.body;
    const booking = await bookingService.updateBookingStatus(req.params.id, status, mileage);
    await logAction(req.user.userId, "UPDATE_BOOKING_STATUS", "Booking", req.params.id, { newStatus: status, mileage });
    res.json({ status: "success", data: booking });
  } catch (err) {
    next(err);
  }
}

export async function cancelBooking(req, res, next) {
  try {
    const booking = await bookingService.cancelBooking(req.params.id, req.user.userId);
    res.json({ status: "success", data: booking });
  } catch (err) {
    next(err);
  }
}
