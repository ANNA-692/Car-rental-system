import { Router } from "express";
import * as reportController from "../controllers/reportController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/dashboard", reportController.getDashboardStats);
router.get("/daily", reportController.getDailyReport);
router.get("/weekly", reportController.getWeeklyReport);
router.get("/monthly", reportController.getMonthlyReport);
router.get("/revenue", reportController.getRevenueData);

router.get("/daily/download", reportController.downloadDailyReport);
router.get("/weekly/download", reportController.downloadWeeklyReport);
router.get("/monthly/download", reportController.downloadMonthlyReport);

export default router;
