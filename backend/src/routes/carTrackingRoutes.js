import { Router } from "express";
import * as carTrackingController from "../controllers/carTrackingController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", carTrackingController.getTrackingDashboard);
router.get("/:carId", carTrackingController.getCarTrackingDetails);
router.patch("/:carId/fuel", carTrackingController.updateFuelLevel);

export default router;
