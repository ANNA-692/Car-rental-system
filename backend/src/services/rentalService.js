import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { parsePagination } from "../utils/helpers.js";

export async function listRentals(query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);
  const where = {};
  if (query.status) where.status = query.status;
  if (query.carId) where.carId = query.carId;
  if (query.userId) where.userId = query.userId;

  const [rentals, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
        car: { select: { id: true, make: true, model: true, licensePlate: true } },
        payment: true,
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return {
    data: rentals,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getRentalById(id) {
  const rental = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true, phone: true } },
      car: { select: { id: true, make: true, model: true, licensePlate: true, pricePerDay: true } },
      payment: true,
    },
  });
  if (!rental) throw new AppError("Rental not found", 404);
  return rental;
}
