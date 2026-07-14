import * as carService from "../services/carService.js";
import { logAction } from "../services/auditLogService.js";

export async function listCars(req, res, next) {
  try {
    const result = await carService.listCars(req.query);
    res.json({ status: "success", ...result });
  } catch (err) {
    next(err);
  }
}

export async function getCarById(req, res, next) {
  try {
    const car = await carService.getCarById(req.params.id);
    res.json({ status: "success", data: car });
  } catch (err) {
    next(err);
  }
}

function parseNumber(value) {
  if (value === undefined || value === "" || value === null) return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export async function createCar(req, res, next) {
  try {
    const payload = {
      ...req.body,
      year: parseNumber(req.body.year),
      seats: parseNumber(req.body.seats),
      mileage: parseNumber(req.body.mileage),
      pricePerDay: parseNumber(req.body.pricePerDay),
      deposit: parseNumber(req.body.deposit),
      imageUrl: req.file ? `/uploads/cars/${req.file.filename}` : req.body.imageUrl,
    };

    const car = await carService.createCar(payload);
    await logAction(req.user.userId, "CREATE_CAR", "Car", car.id, { make: car.make, model: car.model });
    res.status(201).json({ status: "success", data: car });
  } catch (err) {
    next(err);
  }
}

export async function updateCar(req, res, next) {
  try {
    const car = await carService.updateCar(req.params.id, req.body);
    await logAction(req.user.userId, "UPDATE_CAR", "Car", req.params.id, { changes: Object.keys(req.body) });
    res.json({ status: "success", data: car });
  } catch (err) {
    next(err);
  }
}

export async function deleteCar(req, res, next) {
  try {
    await carService.deleteCar(req.params.id);
    await logAction(req.user.userId, "DELETE_CAR", "Car", req.params.id, {});
    res.json({ status: "success", message: "Car deleted" });
  } catch (err) {
    next(err);
  }
}
