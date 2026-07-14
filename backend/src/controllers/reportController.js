import * as reportService from "../services/reportService.js";
import { logAction } from "../services/auditLogService.js";
import { generateReportExcel } from "../utils/reportExcel.js";
import { generateReportPdf } from "../utils/reportPdf.js";

export async function getDashboardStats(req, res, next) {
  try {
    const stats = await reportService.getDashboardStats();
    res.json({ status: "success", data: stats });
  } catch (err) { next(err); }
}

export async function getDailyReport(req, res, next) {
  try {
    const report = await reportService.generateDailyReport();
    await logAction(req.user.userId, "GENERATE_DAILY_REPORT", "Report", null, { period: report.period });
    res.json({ status: "success", data: report });
  } catch (err) { next(err); }
}

export async function getWeeklyReport(req, res, next) {
  try {
    const report = await reportService.generateWeeklyReport();
    await logAction(req.user.userId, "GENERATE_WEEKLY_REPORT", "Report", null, { period: report.period });
    res.json({ status: "success", data: report });
  } catch (err) { next(err); }
}

export async function getMonthlyReport(req, res, next) {
  try {
    const report = await reportService.generateMonthlyReport();
    await logAction(req.user.userId, "GENERATE_MONTHLY_REPORT", "Report", null, { period: report.period });
    res.json({ status: "success", data: report });
  } catch (err) { next(err); }
}

export async function getRevenueData(req, res, next) {
  try {
    const data = await reportService.getRevenueData(req.query);
    res.json({ status: "success", data });
  } catch (err) { next(err); }
}

async function exportReport(req, res, next, reportFn, periodType) {
  try {
    const report = await reportFn();
    const format = (req.query.format || "excel").toLowerCase();

    if (format === "pdf") {
      const pdfBuffer = await generateReportPdf(report, periodType);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${periodType.toLowerCase()}-report.pdf"`);
      return res.send(pdfBuffer);
    }

    const excelBuffer = await generateReportExcel(report, periodType);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${periodType.toLowerCase()}-report.xlsx"`);
    res.send(Buffer.from(excelBuffer));
  } catch (err) { next(err); }
}

export function downloadDailyReport(req, res, next) {
  return exportReport(req, res, next, reportService.generateDailyReport, "Daily");
}

export function downloadWeeklyReport(req, res, next) {
  return exportReport(req, res, next, reportService.generateWeeklyReport, "Weekly");
}

export function downloadMonthlyReport(req, res, next) {
  return exportReport(req, res, next, reportService.generateMonthlyReport, "Monthly");
}
