import prisma from "../config/database.js";

const INTERVAL_MS = 60 * 1000;

async function releaseExpiredBookings() {
  try {
    const now = new Date();

    const expired = await prisma.booking.findMany({
      where: {
        status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
        endDate: { lt: now },
      },
      select: { id: true, carId: true, status: true },
    });

    if (expired.length === 0) return;

    const carIds = [...new Set(expired.map((b) => b.carId))];

    await prisma.booking.updateMany({
      where: {
        id: { in: expired.map((b) => b.id) },
      },
      data: { status: "COMPLETED" },
    });

    for (const carId of carIds) {
      const hasActiveBooking = await prisma.booking.findFirst({
        where: {
          carId,
          id: { notIn: expired.map((b) => b.id) },
          status: { in: ["CONFIRMED", "ACTIVE", "PENDING"] },
          endDate: { gt: now },
        },
      });

      if (!hasActiveBooking) {
        await prisma.car.update({
          where: { id: carId },
          data: { isAvailable: true },
        });
      }
    }

    console.log(`[Scheduler] Auto-completed ${expired.length} expired booking(s)`);
  } catch (err) {
    console.error("[Scheduler] Error releasing expired bookings:", err.message);
  }
}

let intervalId = null;

export function startScheduler() {
  if (intervalId) return;
  releaseExpiredBookings();
  intervalId = setInterval(releaseExpiredBookings, INTERVAL_MS);
  console.log("[Scheduler] Started - checking for expired bookings every 60s");
}

export function stopScheduler() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    console.log("[Scheduler] Stopped");
  }
}
