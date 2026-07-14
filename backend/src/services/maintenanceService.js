import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { parsePagination } from "../utils/helpers.js";

export async function listMaintenance(query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);
  const where = {};
  if (query.carId) where.carId = query.carId;
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;

  const [logs, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { car: { select: { id: true, make: true, model: true, licensePlate: true } } },
    }),
    prisma.maintenanceLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getMaintenanceById(id) {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { car: { select: { id: true, make: true, model: true, licensePlate: true } } },
  });
  if (!log) throw new AppError("Maintenance log not found", 404);
  return log;
}

export async function createMaintenance(data) {
  const car = await prisma.car.findUnique({ where: { id: data.carId } });
  if (!car) throw new AppError("Car not found", 404);

  return prisma.maintenanceLog.create({
    data: { id: uuidv4(), ...data },
    include: { car: { select: { id: true, make: true, model: true, licensePlate: true } } },
  });
}

export async function updateMaintenance(id, data) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) throw new AppError("Maintenance log not found", 404);

  return prisma.maintenanceLog.update({
    where: { id },
    data,
    include: { car: { select: { id: true, make: true, model: true, licensePlate: true } } },
  });
}

export async function deleteMaintenance(id) {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) throw new AppError("Maintenance log not found", 404);
  await prisma.maintenanceLog.delete({ where: { id } });
}
