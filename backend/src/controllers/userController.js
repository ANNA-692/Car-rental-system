import * as userService from "../services/userService.js";
import { logAction } from "../services/auditLogService.js";

export async function createUser(req, res, next) {
  try {
    const payload = {
      ...req.body,
      invoiceImage: req.file ? `/uploads/users/${req.file.filename}` : req.body.invoiceImage,
    };
    const user = await userService.createUser(payload);
    await logAction(req.user.userId, "CREATE_USER", "User", user.id, { role: user.role });
    res.status(201).json({ status: "success", data: user });
  } catch (err) { next(err); }
}

export async function listUsers(req, res, next) {
  try {
    const result = await userService.listUsers(req.query);
    res.json({ status: "success", ...result });
  } catch (err) { next(err); }
}

export async function getUserById(req, res, next) {
  try {
    const user = await userService.getUserById(req.params.id);
    res.json({ status: "success", data: user });
  } catch (err) { next(err); }
}

export async function updateUser(req, res, next) {
  try {
    const payload = { ...req.body };
    if (req.file) {
      payload.invoiceImage = `/uploads/users/${req.file.filename}`;
    }
    const user = await userService.updateUser(req.params.id, payload);
    await logAction(req.user.userId, "UPDATE_USER", "User", req.params.id, { changes: Object.keys(payload) });
    res.json({ status: "success", data: user });
  } catch (err) { next(err); }
}

export async function deleteUser(req, res, next) {
  try {
    await userService.deleteUser(req.params.id);
    await logAction(req.user.userId, "DEACTIVATE_USER", "User", req.params.id, {});
    res.json({ status: "success", message: "User deactivated" });
  } catch (err) { next(err); }
}
