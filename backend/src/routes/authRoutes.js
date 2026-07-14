import { Router } from "express";
import { body } from "express-validator";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadUserInvoice } from "../config/userUpload.js";

const router = Router();

router.post(
  "/register",
  uploadUserInvoice.single("invoiceImage"),
  validate([
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
    body("firstName").notEmpty().withMessage("First name required"),
    body("lastName").notEmpty().withMessage("Last name required"),
    body("phone").optional().isString().withMessage("Phone must be a string"),
    body("address").optional().isString().withMessage("Address must be a string"),
    body("driverLicense").optional().isString().withMessage("Driver license must be a string"),
    body("companyId").optional({ values: "falsy" })
      .matches(/^[A-Z]\d{6}[A-Z]$/)
      .withMessage("Company ID must be in format M123456J"),
    body("make").optional({ values: "falsy" }).isString().withMessage("Make must be a string"),
    body("model").optional({ values: "falsy" }).isString().withMessage("Model must be a string"),
    body("year").optional({ values: "falsy" }).isInt({ min: 1886, max: 2030 }).withMessage("Year must be between 1886 and 2030"),
    body("color").optional({ values: "falsy" }).isString().withMessage("Color must be a string"),
    body("licensePlate").optional({ values: "falsy" }).isString().withMessage("License plate must be a string"),
    body("vin").optional({ values: "falsy" }).isString().withMessage("VIN must be a string"),
    body("category").optional({ values: "falsy" }).isIn(["Sedan", "SUV", "Sports", "Luxury", "Truck", "Van"]).withMessage("Invalid category"),
    body("transmission").optional({ values: "falsy" }).isIn(["Automatic", "Manual"]).withMessage("Transmission must be Automatic or Manual"),
    body("fuelType").optional({ values: "falsy" }).isIn(["Petrol", "Diesel", "Electric", "Hybrid"]).withMessage("Invalid fuel type"),
    body("seats").optional({ values: "falsy" }).isInt({ min: 1, max: 50 }).withMessage("Seats must be between 1 and 50"),
    body("pricePerDay").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("Price per day must be a positive number"),
    body("deposit").optional({ values: "falsy" }).isFloat({ min: 0 }).withMessage("Deposit must be a positive number"),
    body("mileage").optional({ values: "falsy" }).isInt({ min: 0 }).withMessage("Mileage must be a positive integer"),
    body("location").optional({ values: "falsy" }).isString().withMessage("Location must be a string"),
    body("description").optional({ values: "falsy" }).isString().withMessage("Description must be a string"),
    body("conditionNotes").optional({ values: "falsy" }).isString().withMessage("Condition notes must be a string"),
  ]),
  authController.register
);

router.post(
  "/login",
  validate([
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ]),
  authController.login
);

router.post("/refresh", authController.refresh);
router.post("/logout", authenticate, authController.logout);
router.get("/profile", authenticate, authController.getProfile);
router.get("/seed-credentials", authController.getSeedCredentials);

router.patch(
  "/profile",
  authenticate,
  validate([
    body("email").optional().isEmail().withMessage("Valid email required"),
  ]),
  authController.updateProfile
);

export default router;
