import prisma from "../config/database.js";
import bcrypt from "bcryptjs";
import { AppError } from "../middleware/errorHandler.js";
import { parsePagination } from "../utils/helpers.js";
import { generateCompanyId } from "../utils/companyId.js";

export async function listUsers(query) {
  const { skip, take, orderBy, page, limit } = parsePagination(query);
  const where = {};
  if (query.role) where.role = query.role;
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search } },
      { lastName: { contains: query.search } },
      { email: { contains: query.search } },
    ];
  }
  if (query.isActive !== undefined) where.isActive = query.isActive === "true";

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        phone: true, invoiceImage: true, companyId: true, role: true, isActive: true, isVerified: true,
        createdAt: true, updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getUserById(id) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, address: true, driverLicense: true, invoiceImage: true, companyId: true,
      role: true, isActive: true, isVerified: true,
      createdAt: true, updatedAt: true,
      bookings: { take: 5, orderBy: { createdAt: "desc" } },
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function createUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email already registered", 409);

  const companyId = await generateCompanyId();
  const passwordHash = await bcrypt.hash(data.password, 12);

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      address: data.address || null,
      driverLicense: data.driverLicense || null,
      invoiceImage: data.invoiceImage || null,
      companyId,
      role: data.role || "STAFF",
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, address: true, driverLicense: true, invoiceImage: true, companyId: true, role: true, isActive: true,
      createdAt: true,
    },
  });
}

export async function updateUser(id, data) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);

  const updateData = { ...data };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 12);
    delete updateData.password;
  }

  return prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true, email: true, firstName: true, lastName: true,
      phone: true, invoiceImage: true, role: true, isActive: true, isVerified: true,
      createdAt: true, updatedAt: true,
    },
  });
}

export async function deleteUser(id) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new AppError("User not found", 404);
  await prisma.user.update({ where: { id }, data: { isActive: false } });
}
