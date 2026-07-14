import { Router } from "express";
import prisma from "../config/database.js";

const router = Router();

router.get("/cars", async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || "20", 10)));
    const skip = (page - 1) * limit;

    const where = { isActive: true, isAvailable: true };

    if (req.query.make) where.make = { contains: req.query.make };
    if (req.query.category) where.category = req.query.category;
    if (req.query.transmission) where.transmission = req.query.transmission;
    if (req.query.fuelType) where.fuelType = req.query.fuelType;
    if (req.query.minPrice) where.pricePerDay = { ...(where.pricePerDay || {}), gte: parseFloat(req.query.minPrice) };
    if (req.query.maxPrice) where.pricePerDay = { ...(where.pricePerDay || {}), lte: parseFloat(req.query.maxPrice) };

    const [cars, total] = await Promise.all([
      prisma.car.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          color: true,
          licensePlate: true,
          category: true,
          transmission: true,
          fuelType: true,
          seats: true,
          pricePerDay: true,
          deposit: true,
          mileage: true,
          fuelLevel: true,
          location: true,
          description: true,
          features: true,
          imageUrl: true,
          isAvailable: true,
        },
      }),
      prisma.car.count({ where }),
    ]);

    res.json({
      status: "success",
      data: cars,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

router.get("/cars/:id", async (req, res, next) => {
  try {
    const car = await prisma.car.findUnique({
      where: { id: req.params.id, isActive: true },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        color: true,
        licensePlate: true,
        category: true,
        transmission: true,
        fuelType: true,
        seats: true,
        pricePerDay: true,
        pricePerHour: true,
        deposit: true,
        mileage: true,
        fuelLevel: true,
        location: true,
        description: true,
        features: true,
        imageUrl: true,
        conditionNotes: true,
        isAvailable: true,
      },
    });

    if (!car) {
      return res.status(404).json({ status: "error", message: "Car not found" });
    }

    const reviews = await prisma.review.findMany({
      where: { carId: req.params.id },
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { firstName: true, lastName: true } },
      },
    });

    const avgResult = await prisma.review.aggregate({
      where: { carId: req.params.id },
      _avg: { rating: true },
      _count: true,
    });

    res.json({
      status: "success",
      data: {
        ...car,
        reviews,
        averageRating: avgResult._avg.rating || 0,
        totalReviews: avgResult._count,
      },
    });
  } catch (err) { next(err); }
});

router.get("/categories", async (_req, res, next) => {
  try {
    const categories = await prisma.car.groupBy({
      by: ["category"],
      where: { isActive: true, isAvailable: true },
      _count: true,
    });

    res.json({
      status: "success",
      data: categories.map((c) => ({ category: c.category, count: c._count })),
    });
  } catch (err) { next(err); }
});

export default router;
