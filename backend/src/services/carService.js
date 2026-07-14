import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { parsePagination } from "../utils/helpers.js";

export async function listCars(query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);

  const where = { isActive: true };

  if (query.make) where.make = { contains: query.make };
  if (query.model) where.model = { contains: query.model };
  if (query.category) where.category = query.category;
  if (query.transmission) where.transmission = query.transmission;
  if (query.fuelType) where.fuelType = query.fuelType;
  if (query.location) where.location = { contains: query.location };
  if (query.seats) where.seats = parseInt(query.seats, 10);
  if (query.minPrice) where.pricePerDay = { ...(where.pricePerDay || {}), gte: parseFloat(query.minPrice) };
  if (query.maxPrice) where.pricePerDay = { ...(where.pricePerDay || {}), lte: parseFloat(query.maxPrice) };
  if (query.available === "true") where.isAvailable = true;

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      skip,
      take,
      orderBy,
    }),
    prisma.car.count({ where }),
  ]);

  return {
    data: cars,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getCarById(id) {
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) throw new AppError("Car not found", 404);
  return car;
}

export async function createCar(data) {
  const existing = await prisma.car.findUnique({
    where: { licensePlate: data.licensePlate },
  });
  if (existing) throw new AppError("License plate already exists", 409);

  const normalized = {
    id: uuidv4(),
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color || null,
    licensePlate: data.licensePlate,
    vin: data.vin,
    category: data.category,
    transmission: data.transmission,
    fuelType: data.fuelType,
    seats: data.seats,
    pricePerDay: data.pricePerDay,
    deposit: data.deposit || 0,
    mileage: data.mileage != null ? data.mileage : null,
    location: data.location,
    description: data.description || null,
    features: data.features || null,
    imageUrl: data.imageUrl || null,
    conditionNotes: data.conditionNotes || null,
    isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
    isActive: data.isActive !== undefined ? data.isActive : true,
  };

  return prisma.car.create({ data: normalized });
}

export async function updateCar(id, data) {
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) throw new AppError("Car not found", 404);

  return prisma.car.update({ where: { id }, data });
}

export async function deleteCar(id) {
  const car = await prisma.car.findUnique({ where: { id } });
  if (!car) throw new AppError("Car not found", 404);

  await prisma.car.update({
    where: { id },
    data: { isActive: false },
  });
}
