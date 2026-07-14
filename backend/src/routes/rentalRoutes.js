import { Router } from "express";
import * as rentalController from "../controllers/rentalController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", rentalController.listRentals);
router.get("/:id", rentalController.getRentalById);

export default router;
