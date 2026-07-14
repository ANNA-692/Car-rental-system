import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const prisma = new PrismaClient();

const users = [
  {
    id: uuidv4(),
    email: "admin@mollash.com",
    password: "Admin@123",
    firstName: "System",
    lastName: "Admin",
    phone: "+263771234567",
    role: "ADMIN",
    isVerified: true,
    isActive: true,
  },
  {
    id: uuidv4(),
    email: "john@example.com",
    password: "Customer@123",
    firstName: "John",
    lastName: "Doe",
    phone: "+263772345678",
    role: "CUSTOMER",
    isVerified: true,
    isActive: true,
  },
  {
    id: uuidv4(),
    email: "staff@mollash.com",
    password: "Staff@123",
    firstName: "Sarah",
    lastName: "Staff",
    phone: "+263773456789",
    role: "STAFF",
    isVerified: true,
    isActive: true,
  },
];

const cars = [
  {
    id: uuidv4(),
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    vin: "VIN12345678901234",
    licensePlate: "ABZ-123",
    pricePerDay: 50,
    seats: 5,
    location: "Harare Central",
    fuelType: "Petrol",
    transmission: "Automatic",
    category: "Sedan",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-35a1d09055f5?w=500",
    isActive: true,
    isAvailable: true,
    description: "Reliable daily driver with good fuel efficiency",
  },
  {
    id: uuidv4(),
    make: "Honda",
    model: "CR-V",
    year: 2023,
    vin: "VIN23456789012345",
    licensePlate: "ABZ-124",
    pricePerDay: 75,
    seats: 7,
    location: "Harare South",
    fuelType: "Petrol",
    transmission: "Automatic",
    category: "SUV",
    imageUrl: "https://images.unsplash.com/photo-1606611281579-70bdc8c8c25c?w=500",
    isActive: true,
    isAvailable: true,
    description: "Spacious SUV perfect for family trips",
  },
  {
    id: uuidv4(),
    make: "Ford",
    model: "Ranger",
    year: 2022,
    vin: "VIN34567890123456",
    licensePlate: "ABZ-125",
    pricePerDay: 65,
    seats: 5,
    location: "Harare East",
    fuelType: "Diesel",
    transmission: "Manual",
    category: "Pickup",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-35a1d09055f5?w=500",
    isActive: true,
    isAvailable: true,
    description: "Powerful pickup truck for work and adventure",
  },
  {
    id: uuidv4(),
    make: "Hyundai",
    model: "Elantra",
    year: 2023,
    vin: "VIN45678901234567",
    licensePlate: "ABZ-126",
    pricePerDay: 45,
    seats: 5,
    location: "Harare North",
    fuelType: "Petrol",
    transmission: "Automatic",
    category: "Sedan",
    imageUrl: "https://images.unsplash.com/photo-1566014174386-996b1ff37f1b?w=500",
    isActive: true,
    isAvailable: true,
    description: "Affordable sedan with modern features",
  },
  {
    id: uuidv4(),
    make: "Mazda",
    model: "CX-5",
    year: 2023,
    vin: "VIN56789012345678",
    licensePlate: "ABZ-127",
    pricePerDay: 80,
    seats: 5,
    location: "Harare West",
    fuelType: "Petrol",
    transmission: "Automatic",
    category: "SUV",
    imageUrl: "https://images.unsplash.com/photo-1606611281579-70bdc8c8c25c?w=500",
    isActive: true,
    isAvailable: true,
    description: "Premium SUV with comfort and style",
  },
];

async function seed() {
  console.log("Seeding database...");

  // Seed users
  console.log("\nSeeding users...");
  for (const userData of users) {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) {
      console.log(`✓ User ${userData.email} already exists`);
      continue;
    }

    const passwordHash = await bcrypt.hash(userData.password, 12);
    const { password, ...rest } = userData;

    await prisma.user.create({
      data: { ...rest, passwordHash },
    });

    console.log(`✓ Created user: ${userData.email} (${userData.role})`);
  }

  // Seed cars
  console.log("\nSeeding cars...");
  for (const carData of cars) {
    const existing = await prisma.car.findUnique({ where: { vin: carData.vin } });
    if (existing) {
      console.log(`✓ Car ${carData.make} ${carData.model} already exists`);
      continue;
    }

    await prisma.car.create({
      data: carData,
    });

    console.log(`✓ Created car: ${carData.make} ${carData.model} (${carData.year})`);
  }

  console.log("\n✓ Seeding complete!");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
