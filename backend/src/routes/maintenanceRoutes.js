import { Router } from "express";
import { body } from "express-validator";
import * as maintenanceController from "../controllers/maintenanceController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { uploadInvoice } from "../config/maintenanceUpload.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.get("/", maintenanceController.listMaintenance);
router.get("/:id", maintenanceController.getMaintenanceById);

router.post(
  "/",
  uploadInvoice.single("invoiceImage"),
  validate([
    body("carId").notEmpty().withMessage("Car ID required"),
    body("description").notEmpty().withMessage("Description required"),
    body("type").notEmpty().withMessage("Type required"),
    body("cost").isFloat({ min: 0 }).withMessage("Cost must be positive"),
    body("invoiceImage").custom((_, { req }) => {
      if (!req.file) throw new Error("Invoice image is required");
      return true;
    }),
  ]),
  maintenanceController.createMaintenance
);

router.put(
  "/:id",
  uploadInvoice.single("invoiceImage"),
  maintenanceController.updateMaintenance
);
router.delete("/:id", maintenanceController.deleteMaintenance);

export default router;
