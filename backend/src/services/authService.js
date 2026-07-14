import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";
import { generateCompanyId } from "../utils/companyId.js";

const SEED_CREDENTIALS = [
  { email: "admin@mollash.com", password: "Admin@123", role: "ADMIN", name: "System Admin" },
  { email: "john@example.com", password: "Customer@123", role: "CUSTOMER", name: "John Doe" },
  { email: "staff@mollash.com", password: "Staff@123", role: "STAFF", name: "Sarah Staff" },
];

export function getSeedCredentials() {
  return SEED_CREDENTIALS;
}

function generateTokens(payload) {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || "secret",
    { expiresIn: "15m" }
  );
  const refreshToken = jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET || "refresh-secret",
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
}

export async function registerUser(data) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw new AppError("Email already registered", 409);

  const role = "CUSTOMER";
  const companyId = null;

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: data.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone || null,
      address: data.address || null,
      driverLicense: data.driverLicense || null,
      invoiceImage: data.invoiceImage || null,
      companyId,
      role,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      driverLicense: true,
      invoiceImage: true,
      companyId: true,
      role: true,
      createdAt: true,
    },
  });

  let car = null;
  if (data.make && data.make.trim()) {
    const year = parseInt(data.year);
    const seats = parseInt(data.seats);
    const pricePerDay = parseFloat(data.pricePerDay);
    const deposit = parseFloat(data.deposit);
    const mileage = parseInt(data.mileage);

    if (isNaN(year) || year < 1886 || year > 2030) {
      throw new AppError("Valid vehicle year is required (1886-2030)", 400);
    }
    if (!data.licensePlate || !data.licensePlate.trim()) {
      throw new AppError("License plate is required", 400);
    }
    if (!data.vin || !data.vin.trim()) {
      throw new AppError("VIN is required", 400);
    }

    const existingPlate = await prisma.car.findUnique({ where: { licensePlate: data.licensePlate.trim() } });
    if (existingPlate) throw new AppError("License plate already registered", 409);

    const existingVin = await prisma.car.findUnique({ where: { vin: data.vin.trim() } });
    if (existingVin) throw new AppError("VIN already registered", 409);

    car = await prisma.car.create({
      data: {
        id: uuidv4(),
        make: data.make.trim(),
        model: data.model ? data.model.trim() : "Unknown",
        year,
        color: data.color || null,
        licensePlate: data.licensePlate.trim(),
        vin: data.vin.trim(),
        category: data.category || "Sedan",
        transmission: data.transmission || "Automatic",
        fuelType: data.fuelType || "Petrol",
        seats: isNaN(seats) || seats < 1 ? 5 : seats,
        pricePerDay: isNaN(pricePerDay) || pricePerDay < 0 ? 0 : pricePerDay,
        deposit: isNaN(deposit) || deposit < 0 ? 0 : deposit,
        mileage: isNaN(mileage) ? null : mileage,
        location: data.location || "",
        description: data.description || null,
        conditionNotes: data.conditionNotes || null,
        isActive: false,
      },
    });

    await prisma.auditLog.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        action: "CREATE",
        entity: "Car",
        entityId: car.id,
        details: `Vehicle registered during account creation: ${car.make} ${car.model} (${car.licensePlate})`,
      },
    });
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user, car, ...tokens };
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Invalid email or password", 401);
  if (!user.isActive) throw new AppError("Account is deactivated", 403);

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new AppError("Invalid email or password", 401);

  const payload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  const { passwordHash: _, refreshToken: __, resetToken: ___, resetTokenExp: ____, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

export async function refreshAccessToken(refreshToken) {
  const secret = process.env.JWT_REFRESH_SECRET || "refresh-secret";
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, secret);
  } catch {
    throw new AppError("Invalid refresh token", 401);
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || user.refreshToken !== refreshToken || !user.isActive) {
    throw new AppError("Invalid refresh token", 401);
  }

  const payload = { userId: user.id, email: user.email, role: user.role };
  const tokens = generateTokens(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
}

export async function logoutUser(userId) {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
}

export async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      driverLicense: true,
      invoiceImage: true,
      companyId: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });
  if (!user) throw new AppError("User not found", 404);
  return user;
}

export async function updateProfile(userId, data) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      address: true,
      driverLicense: true,
      invoiceImage: true,
      companyId: true,
      role: true,
      createdAt: true,
    },
  });
  return user;
}
