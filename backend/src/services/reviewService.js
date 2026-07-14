import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { parsePagination } from "../utils/helpers.js";

export async function createReview(data) {
  if (data.rating < 1 || data.rating > 5) {
    throw new AppError("Rating must be between 1 and 5", 400);
  }

  const booking = await prisma.booking.findUnique({ where: { id: data.bookingId } });
  if (!booking) throw new AppError("Booking not found", 404);
  if (booking.userId !== data.userId) throw new AppError("Not authorized", 403);
  if (booking.status !== "COMPLETED") {
    throw new AppError("Can only review completed bookings", 400);
  }

  const existing = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });
  if (existing) throw new AppError("Review already exists for this booking", 409);

  return prisma.review.create({
    data: {
      id: uuidv4(),
      userId: data.userId,
      carId: data.carId,
      bookingId: data.bookingId,
      rating: data.rating,
      comment: data.comment,
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function getCarReviews(carId, query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);

  const [reviews, total, aggregate] = await Promise.all([
    prisma.review.findMany({
      where: { carId },
      skip,
      take,
      orderBy,
      include: {
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.review.count({ where: { carId } }),
    prisma.review.aggregate({
      where: { carId },
      _avg: { rating: true },
    }),
  ]);

  return {
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    averageRating: aggregate._avg.rating || 0,
  };
}

export async function getUserReviews(userId, query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { userId },
      skip,
      take,
      orderBy,
      include: { car: true },
    }),
    prisma.review.count({ where: { userId } }),
  ]);

  return {
    data: reviews,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function deleteReview(id, userId) {
  const review = await prisma.review.findUnique({ where: { id } });
  if (!review) throw new AppError("Review not found", 404);
  if (review.userId !== userId) throw new AppError("Not authorized", 403);

  await prisma.review.delete({ where: { id } });
}
