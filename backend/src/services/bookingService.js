import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { parsePagination, calculateBookingCost } from "../utils/helpers.js";

export async function createBooking(data) {
  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car || !car.isActive) throw new AppError("Car not found", 404);
  if (!car.isAvailable) throw new AppError("Car is not available", 400);

  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (startDate >= endDate) {
    throw new AppError("End date must be after start date", 400);
  }
  if (startDate < new Date()) {
    throw new AppError("Start date must be in the future", 400);
  }

  const conflicting = await prisma.booking.findFirst({
    where: {
      carId: data.carId,
      status: { in: ["CONFIRMED", "ACTIVE"] },
      startDate: { lt: endDate },
      endDate: { gt: startDate },
    },
  });
  if (conflicting) throw new AppError("Car is already booked for these dates", 409);

  const totalAmount = calculateBookingCost(car.pricePerDay, startDate, endDate);

  const booking = await prisma.booking.create({
    data: {
      id: uuidv4(),
      userId: data.userId,
      carId: data.carId,
      startDate,
      endDate,
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation,
      notes: data.notes,
      totalAmount,
      status: "PENDING",
    },
    include: { car: true },
  });

  await prisma.car.update({
    where: { id: data.carId },
    data: { isAvailable: false },
  });

  return booking;
}

export async function getUserBookings(userId, query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: { userId },
      skip,
      take,
      orderBy,
      include: { car: true, payment: true },
    }),
    prisma.booking.count({ where: { userId } }),
  ]);

  return {
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getAllBookings(query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status;

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } }, car: true, payment: true },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data: bookings,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getBookingById(id) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true } }, car: true, payment: true },
  });
  if (!booking) throw new AppError("Booking not found", 404);
  return booking;
}

export async function updateBookingStatus(id, status, mileage) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new AppError("Booking not found", 404);

  const updateData = { status };

  if (status === "ACTIVE" && mileage != null) {
    updateData.mileageOut = parseInt(mileage, 10);
  }

  if (status === "COMPLETED" && mileage != null) {
    updateData.mileageIn = parseInt(mileage, 10);
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: { car: true, payment: true },
  });

  if (status === "CANCELLED" || status === "COMPLETED") {
    const now = new Date();
    const hasActiveBooking = await prisma.booking.findFirst({
      where: {
        carId: booking.carId,
        id: { not: id },
        status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
        endDate: { gt: now },
      },
    });

    if (!hasActiveBooking) {
      await prisma.car.update({
        where: { id: booking.carId },
        data: { isAvailable: true },
      });
    }
  }

  if (status === "COMPLETED" && mileage != null) {
    await prisma.car.update({
      where: { id: booking.carId },
      data: { mileage: parseInt(mileage, 10) },
    });
  }

  return updated;
}

export async function cancelBooking(id, userId) {
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.userId !== userId) throw new AppError("Not authorized", 403);
  if (["COMPLETED", "CANCELLED"].includes(booking.status)) {
    throw new AppError("Booking cannot be cancelled", 400);
  }

  return updateBookingStatus(id, "CANCELLED");
}
