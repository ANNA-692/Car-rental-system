import prisma from "../config/database.js";

export async function getDashboardStats() {
  const [
    totalCars,
    availableCars,
    totalBookings,
    activeRentals,
    totalCustomers,
    totalPayments,
    revenue,
    pendingBookings,
  ] = await Promise.all([
    prisma.car.count({ where: { isActive: true } }),
    prisma.car.count({ where: { isActive: true, isAvailable: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.payment.count({ where: { status: "PAID" } }),
    prisma.payment.aggregate({ where: { status: "PAID" }, _sum: { amount: true } }),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ]);

  return {
    totalCars,
    availableCars,
    totalBookings,
    activeRentals,
    totalCustomers,
    totalPayments,
    totalRevenue: revenue._sum.amount || 0,
    pendingBookings,
  };
}

export async function generateDailyReport() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

  const [
    newBookings,
    completedRentals,
    revenue,
    newCustomers,
    carsByCategory,
    paymentMethods,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
    prisma.booking.count({ where: { status: "COMPLETED", updatedAt: { gte: today, lt: tomorrow } } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: today, lt: tomorrow } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: today, lt: tomorrow } } }),
    prisma.car.groupBy({ by: ["category"], _count: true }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { status: "PAID", paidAt: { gte: today, lt: tomorrow } },
      _count: true,
      _sum: { amount: true },
    }),
  ]);

  return {
    period: { from: today.toISOString(), to: tomorrow.toISOString(), type: "DAILY" },
    generatedAt: now.toISOString(),
    newBookings,
    completedRentals,
    revenue: revenue._sum.amount || 0,
    newCustomers,
    carsByCategory: carsByCategory.map((c) => ({ category: c.category, count: c._count })),
    paymentMethods: paymentMethods.map((p) => ({
      method: p.method,
      count: p._count,
      total: p._sum.amount,
    })),
  };
}

export async function generateWeeklyReport() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    newBookings,
    completedRentals,
    revenue,
    newCustomers,
    carsByCategory,
    paymentMethods,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.booking.count({ where: { status: "COMPLETED", updatedAt: { gte: weekAgo } } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: weekAgo } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: weekAgo } } }),
    prisma.car.groupBy({ by: ["category"], _count: true }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { status: "PAID", paidAt: { gte: weekAgo } },
      _count: true,
      _sum: { amount: true },
    }),
  ]);

  return {
    period: { from: weekAgo.toISOString(), to: now.toISOString(), type: "WEEKLY" },
    generatedAt: now.toISOString(),
    newBookings,
    completedRentals,
    revenue: revenue._sum.amount || 0,
    newCustomers,
    carsByCategory: carsByCategory.map((c) => ({ category: c.category, count: c._count })),
    paymentMethods: paymentMethods.map((p) => ({
      method: p.method,
      count: p._count,
      total: p._sum.amount,
    })),
  };
}

export async function generateMonthlyReport() {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    newBookings,
    completedRentals,
    revenue,
    newCustomers,
    carsByCategory,
    paymentMethods,
    maintenanceCosts,
  ] = await Promise.all([
    prisma.booking.count({ where: { createdAt: { gte: monthAgo } } }),
    prisma.booking.count({ where: { status: "COMPLETED", updatedAt: { gte: monthAgo } } }),
    prisma.payment.aggregate({
      where: { status: "PAID", paidAt: { gte: monthAgo } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER", createdAt: { gte: monthAgo } } }),
    prisma.car.groupBy({ by: ["category"], _count: true }),
    prisma.payment.groupBy({
      by: ["method"],
      where: { status: "PAID", paidAt: { gte: monthAgo } },
      _count: true,
      _sum: { amount: true },
    }),
    prisma.maintenanceLog.aggregate({
      where: { createdAt: { gte: monthAgo }, status: "COMPLETED" },
      _sum: { cost: true },
    }),
  ]);

  return {
    period: { from: monthAgo.toISOString(), to: now.toISOString(), type: "MONTHLY" },
    generatedAt: now.toISOString(),
    newBookings,
    completedRentals,
    revenue: revenue._sum.amount || 0,
    newCustomers,
    maintenanceCosts: maintenanceCosts._sum.cost || 0,
    carsByCategory: carsByCategory.map((c) => ({ category: c.category, count: c._count })),
    paymentMethods: paymentMethods.map((p) => ({
      method: p.method,
      count: p._count,
      total: p._sum.amount,
    })),
  };
}

export async function getRevenueData(query) {
  const days = parseInt(query.days || "30", 10);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const payments = await prisma.payment.findMany({
    where: { status: "PAID", paidAt: { gte: since } },
    orderBy: { paidAt: "asc" },
    select: { amount: true, paidAt: true, method: true },
  });

  return { days, data: payments };
}
