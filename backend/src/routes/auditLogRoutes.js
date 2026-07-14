import { Router } from "express";
import * as auditLogController from "../controllers/auditLogController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", auditLogController.listAuditLogs);

export default router;
