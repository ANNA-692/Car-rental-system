import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createCanvas, loadImage } from "canvas";
import pixelmatch from "pixelmatch";
import { v4 as uuidv4 } from "uuid";
import prisma from "../config/database.js";
import { AppError } from "../middleware/errorHandler.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const diffDir = path.join(__dirname, "../../uploads/condition");

export async function uploadConditionImage(carId, userId, file, label) {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new AppError("Car not found", 404);

  const imageUrl = `/uploads/condition/${file.filename}`;

  return prisma.carConditionImage.create({
    data: {
      carId,
      uploadedBy: userId,
      imageUrl,
      label: label || null,
    },
  });
}

export async function listConditionImages(carId) {
  return prisma.carConditionImage.findMany({
    where: { carId },
    orderBy: { createdAt: "desc" },
    include: {
      uploader: { select: { id: true, firstName: true, lastName: true } },
    },
  });
}

export async function compareImages(carId, baselineId, comparisonId, userId) {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new AppError("Car not found", 404);

  const baseline = await prisma.carConditionImage.findUnique({ where: { id: baselineId } });
  const comparison = await prisma.carConditionImage.findUnique({ where: { id: comparisonId } });
  if (!baseline || !comparison) throw new AppError("Image not found", 404);
  if (baseline.carId !== carId || comparison.carId !== carId) {
    throw new AppError("Images must belong to the same car", 400);
  }

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const uploadsDir = path.join(__dirname, "../../uploads/condition");
  const baselinePath = path.join(uploadsDir, path.basename(baseline.imageUrl));
  const comparisonPath = path.join(uploadsDir, path.basename(comparison.imageUrl));

  let baselineImg;
  let comparisonImg;
  try {
    baselineImg = await loadImage(baselinePath);
    comparisonImg = await loadImage(comparisonPath);
  } catch {
    throw new AppError("Could not read image files for comparison", 500);
  }

  const width = Math.max(baselineImg.width, comparisonImg.width);
  const height = Math.max(baselineImg.height, comparisonImg.height);

  const canvas1 = createCanvas(width, height);
  const ctx1 = canvas1.getContext("2d");
  ctx1.drawImage(baselineImg, 0, 0);

  const canvas2 = createCanvas(width, height);
  const ctx2 = canvas2.getContext("2d");
  ctx2.drawImage(comparisonImg, 0, 0);

  const img1 = ctx1.getImageData(0, 0, width, height);
  const img2 = ctx2.getImageData(0, 0, width, height);
  const diff = createCanvas(width, height);
  const diffCtx = diff.getContext("2d");
  const diffData = diffCtx.createImageData(width, height);

  const mismatchedPixels = pixelmatch(img1.data, img2.data, diffData.data, width, height, {
    threshold: 0.15,
    includeAA: true,
    alpha: 0.5,
    diffColor: [255, 0, 0],
  });

  diffCtx.putImageData(diffData, 0, 0);

  const diffFilename = `diff_${uuidv4()}.png`;
  const diffPath = path.join(uploadsDir, diffFilename);
  const out = await fs.writeFile(diffPath, diff.toBuffer("image/png"));

  const totalPixels = width * height;
  const damagePercent = Math.round((mismatchedPixels / totalPixels) * 10000) / 100;

  const damageAreas = countDamageAreas(diffData.data, width, height);

  return prisma.damageReport.create({
    data: {
      carId,
      baselineImageId: baselineId,
      comparisonImageId: comparisonId,
      diffImageUrl: `/uploads/condition/${diffFilename}`,
      damagePercent,
      damageAreas,
      status: "PENDING",
    },
    include: {
      baselineImage: true,
      comparisonImage: true,
    },
  });
}

function countDamageAreas(data, width, height) {
  const visited = new Set();
  let areas = 0;

  function dfs(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited.has(idx)) return;
    const pixelIdx = idx * 4;
    if (data[pixelIdx] > 50) {
      visited.add(idx);
      dfs(x - 1, y);
      dfs(x + 1, y);
      dfs(x, y - 1);
      dfs(x, y + 1);
    }
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x += 4) {
      const idx = y * width + x;
      if (visited.has(idx)) continue;
      const pixelIdx = idx * 4;
      if (data[pixelIdx] > 50) {
        areas++;
        dfs(x, y);
      }
    }
  }

  return areas;
}

export async function listDamageReports(carId) {
  return prisma.damageReport.findMany({
    where: { carId },
    orderBy: { createdAt: "desc" },
    include: {
      baselineImage: true,
      comparisonImage: true,
    },
  });
}

export async function reviewDamageReport(id, data, userId) {
  const report = await prisma.damageReport.findUnique({ where: { id } });
  if (!report) throw new AppError("Damage report not found", 404);

  return prisma.damageReport.update({
    where: { id },
    data: {
      status: data.status,
      notes: data.notes,
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  });
}

export async function deleteConditionImage(id) {
  const image = await prisma.carConditionImage.findUnique({ where: { id } });
  if (!image) throw new AppError("Image not found", 404);

  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const filePath = path.join(__dirname, "../../", image.imageUrl);
  try { await fs.unlink(filePath); } catch {}

  await prisma.carConditionImage.delete({ where: { id } });
}
