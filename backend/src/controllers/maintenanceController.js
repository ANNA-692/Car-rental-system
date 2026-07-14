import * as maintenanceService from "../services/maintenanceService.js";
import { logAction } from "../services/auditLogService.js";

export async function listMaintenance(req, res, next) {
  try {
    const result = await maintenanceService.listMaintenance(req.query);
    res.json({ status: "success", ...result });
  } catch (err) { next(err); }
}

export async function getMaintenanceById(req, res, next) {
  try {
    const log = await maintenanceService.getMaintenanceById(req.params.id);
    res.json({ status: "success", data: log });
  } catch (err) { next(err); }
}

export async function createMaintenance(req, res, next) {
  try {
    const payload = {
      ...req.body,
      cost: parseFloat(req.body.cost),
      invoiceImage: req.file ? `/uploads/maintenance/${req.file.filename}` : null,
    };
    const log = await maintenanceService.createMaintenance(payload);
    await logAction(req.user.userId, "CREATE_MAINTENANCE", "MaintenanceLog", log.id, { carId: req.body.carId });
    res.status(201).json({ status: "success", data: log });
  } catch (err) { next(err); }
}

export async function updateMaintenance(req, res, next) {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.invoiceImage = `/uploads/maintenance/${req.file.filename}`;
    }
    if (payload.cost) payload.cost = parseFloat(payload.cost);
    const log = await maintenanceService.updateMaintenance(req.params.id, payload);
    await logAction(req.user.userId, "UPDATE_MAINTENANCE", "MaintenanceLog", req.params.id, { changes: Object.keys(payload) });
    res.json({ status: "success", data: log });
  } catch (err) { next(err); }
}

export async function deleteMaintenance(req, res, next) {
  try {
    await maintenanceService.deleteMaintenance(req.params.id);
    await logAction(req.user.userId, "DELETE_MAINTENANCE", "MaintenanceLog", req.params.id, {});
    res.json({ status: "success", message: "Maintenance log deleted" });
  } catch (err) { next(err); }
}
