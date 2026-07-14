import prisma from "../config/database.js";
import { v4 as uuidv4 } from "uuid";

export async function logAction(userId, action, entity, entityId, details) {
  if (!userId) return null;
  return prisma.auditLog.create({
    data: {
      id: uuidv4(),
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
      user: { connect: { id: userId } },
    },
  });
}

export async function listAuditLogs(query) {
  const page = Math.max(1, parseInt(query.page || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || "50", 10)));
  const skip = (page - 1) * limit;

  const where = {};
  if (query.entity) where.entity = query.entity;
  if (query.action) where.action = query.action;
  if (query.userId) where.userId = query.userId;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
