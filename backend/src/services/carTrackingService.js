import prisma from "../config/database.js";

export async function getCarTrackingDashboard() {
  const [totalCars, availableCars, activeCars, maintenanceCars, carTracking] = await Promise.all([
    prisma.car.count({ where: { isActive: true } }),
    prisma.car.count({ where: { isActive: true, isAvailable: true } }),
    prisma.booking.count({ where: { status: "ACTIVE" } }),
    prisma.maintenanceLog.count({ where: { status: "IN_PROGRESS" } }),
    getDetailedCarTracking(),
  ]);

  return {
    summary: {
      totalCars,
      availableCars,
      activeCars,
      maintenanceCars,
      inactiveCars: totalCars - availableCars - activeCars - maintenanceCars,
    },
    carTracking,
  };
}

export async function getDetailedCarTracking() {
  const cars = await prisma.car.findMany({
    where: { isActive: true },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      licensePlate: true,
      location: true,
      mileage: true,
      fuelLevel: true,
      isAvailable: true,
    },
  });

  const carTrackingData = await Promise.all(
    cars.map(async (car) => {
      // Get current rental if active
      const activeBooking = await prisma.booking.findFirst({
        where: { carId: car.id, status: "ACTIVE" },
        include: {
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        },
      });

      // Get rental history
      const recentBookings = await prisma.booking.findMany({
        where: { carId: car.id, status: { in: ["COMPLETED", "CANCELLED"] } },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          mileageOut: true,
          mileageIn: true,
          fuelAtPickup: true,
          fuelAtDropoff: true,
          pickupLocation: true,
          dropoffLocation: true,
          status: true,
        },
        orderBy: { endDate: "desc" },
        take: 5,
      });

      // Get pending maintenance
      const pendingMaintenance = await prisma.maintenanceLog.findMany({
        where: { carId: car.id, status: "PENDING" },
        select: {
          id: true,
          type: true,
          description: true,
          cost: true,
          scheduledDate: true,
        },
        take: 3,
      });

      // Calculate utilization
      const allBookings = await prisma.booking.count({ where: { carId: car.id } });
      const completedBookings = await prisma.booking.count({
        where: { carId: car.id, status: "COMPLETED" },
      });

      // Calculate average fuel consumption per trip
      const completedRentals = await prisma.booking.findMany({
        where: {
          carId: car.id,
          status: "COMPLETED",
          fuelAtPickup: { not: null },
          fuelAtDropoff: { not: null },
        },
        select: { fuelAtPickup: true, fuelAtDropoff: true },
        take: 10,
      });

      const avgFuelConsumption =
        completedRentals.length > 0
          ? completedRentals.reduce((sum, r) => sum + (r.fuelAtPickup - r.fuelAtDropoff), 0) /
            completedRentals.length
          : 0;

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        licensePlate: car.licensePlate,
        location: car.location,
        mileage: car.mileage,
        fuelLevel: car.fuelLevel,
        status: car.isAvailable ? "AVAILABLE" : activeBooking ? "IN_USE" : "UNAVAILABLE",
        currentRental: activeBooking
          ? {
              userId: activeBooking.userId,
              customer: `${activeBooking.user.firstName} ${activeBooking.user.lastName}`,
              email: activeBooking.user.email,
              phone: activeBooking.user.phone,
              pickupLocation: activeBooking.pickupLocation,
              dropoffLocation: activeBooking.dropoffLocation,
              startDate: activeBooking.startDate,
              endDate: activeBooking.endDate,
              mileageOut: activeBooking.mileageOut,
            }
          : null,
        rentalHistory: recentBookings,
        pendingMaintenance,
        utilization: {
          totalRentals: allBookings,
          completedRentals,
          avgFuelConsumption: Number(avgFuelConsumption.toFixed(2)),
        },
      };
    })
  );

  return carTrackingData.sort((a, b) => {
    // Sort: In Use first, then Available, then others
    const statusOrder = { "IN_USE": 0, AVAILABLE: 1, UNAVAILABLE: 2 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}

export async function getCarDetails(carId) {
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      bookings: {
        orderBy: { endDate: "desc" },
        take: 20,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          payment: { select: { status: true, amount: true } },
        },
      },
      maintenanceLogs: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!car) return null;

  return {
    ...car,
    stats: {
      totalMiles: car.mileage,
      totalTrips: car.bookings.length,
      completedTrips: car.bookings.filter((b) => b.status === "COMPLETED").length,
      totalRevenue: car.bookings
        .filter((b) => b.payment?.status === "PAID")
        .reduce((sum, b) => sum + (b.payment?.amount || 0), 0),
      maintenanceCount: car.maintenanceLogs.length,
      pendingMaintenance: car.maintenanceLogs.filter((m) => m.status === "PENDING").length,
    },
  };
}

export async function updateCarFuelLevel(carId, fuelLevel) {
  return prisma.car.update({
    where: { id: carId },
    data: { fuelLevel },
  });
}
