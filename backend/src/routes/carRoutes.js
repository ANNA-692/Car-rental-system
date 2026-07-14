import { Router } from "express";
import { body } from "express-validator";
import * as carController from "../controllers/carController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadCarImage } from "../config/carUpload.js";

const router = Router();

router.get("/", carController.listCars);
router.get("/:id", carController.getCarById);

router.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  uploadCarImage.single("image"),
  validate([
    body("make").notEmpty().withMessage("Make required"),
    body("model").notEmpty().withMessage("Model required"),
    body("year").isInt({ min: 1900 }).withMessage("Valid year required"),
    body("licensePlate").notEmpty().withMessage("License plate required"),
    body("vin").notEmpty().withMessage("VIN required"),
    body("category").notEmpty().withMessage("Category required"),
    body("transmission").notEmpty().withMessage("Transmission required"),
    body("fuelType").notEmpty().withMessage("Fuel type required"),
    body("seats").isInt({ min: 1 }).withMessage("Seats must be at least 1"),
    body("pricePerDay").isFloat({ min: 0 }).withMessage("Price per day must be positive"),
    body("location").notEmpty().withMessage("Location required"),
    body("mileage").optional().isInt({ min: 0 }).withMessage("Mileage must be a positive integer"),
    body("conditionNotes").optional().isString().withMessage("Condition notes must be text"),
  ]),
  carController.createCar
);

router.put("/:id", authenticate, authorize("ADMIN"), carController.updateCar);
router.delete("/:id", authenticate, authorize("ADMIN"), carController.deleteCar);

export default router;
