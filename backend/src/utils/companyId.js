import prisma from "../config/database.js";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomLetter() {
  return LETTERS[Math.floor(Math.random() * 26)];
}

function randomDigits(length) {
  let result = "";
  for (let i = 0; i < length; i++) {
    result += Math.floor(Math.random() * 10);
  }
  return result;
}

function generate() {
  return `${randomLetter()}${randomDigits(6)}${randomLetter()}`;
}

export async function generateCompanyId() {
  for (let attempt = 0; attempt < 20; attempt++) {
    const companyId = generate();
    const existing = await prisma.user.findUnique({ where: { companyId } });
    if (!existing) return companyId;
  }
  throw new Error("Failed to generate unique company ID after 20 attempts");
}
