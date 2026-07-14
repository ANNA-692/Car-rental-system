import * as conditionService from "../services/conditionService.js";
import { logAction } from "../services/auditLogService.js";

export async function uploadImage(req, res, next) {
  try {
    const image = await conditionService.uploadConditionImage(
      req.params.carId,
      req.user.userId,
      req.file,
      req.body.label
    );
    await logAction(req.user.userId, "UPLOAD_CONDITION_IMAGE", "Car", req.params.carId, `Uploaded condition image: ${req.file.filename}`);
    res.status(201).json({ status: "success", data: image });
  } catch (err) { next(err); }
}

export async function listImages(req, res, next) {
  try {
    const images = await conditionService.listConditionImages(req.params.carId);
    res.json({ status: "success", data: images });
  } catch (err) { next(err); }
}

export async function compare(req, res, next) {
  try {
    const { baselineImageId, comparisonImageId } = req.body;
    const report = await conditionService.compareImages(
      req.params.carId,
      baselineImageId,
      comparisonImageId,
      req.user.userId
    );
    await logAction(req.user.userId, "RUN_DAMAGE_COMPARISON", "Car", req.params.carId, `Compared images: ${baselineImageId} vs ${comparisonImageId}`);
    res.status(201).json({ status: "success", data: report });
  } catch (err) { next(err); }
}

export async function listReports(req, res, next) {
  try {
    const reports = await conditionService.listDamageReports(req.params.carId);
    res.json({ status: "success", data: reports });
  } catch (err) { next(err); }
}

export async function reviewReport(req, res, next) {
  try {
    const report = await conditionService.reviewDamageReport(req.params.id, req.body, req.user.userId);
    await logAction(req.user.userId, "REVIEW_DAMAGE_REPORT", "DamageReport", req.params.id, `Reviewed with status: ${req.body.status}`);
    res.json({ status: "success", data: report });
  } catch (err) { next(err); }
}

export async function deleteImage(req, res, next) {
  try {
    await conditionService.deleteConditionImage(req.params.id);
    res.json({ status: "success", message: "Image deleted" });
  } catch (err) { next(err); }
}
