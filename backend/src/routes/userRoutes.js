import { Router } from "express";
import * as userController from "../controllers/userController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadUserInvoice } from "../config/userUpload.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/", uploadUserInvoice.single("invoiceImage"), userController.createUser);
router.get("/", userController.listUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", uploadUserInvoice.single("invoiceImage"), userController.updateUser);
router.delete("/:id", userController.deleteUser);

export default router;
