import * as auditLogService from "../services/auditLogService.js";

export async function listAuditLogs(req, res, next) {
  try {
    const result = await auditLogService.listAuditLogs(req.query);
    res.json({ status: "success", ...result });
  } catch (err) { next(err); }
}
