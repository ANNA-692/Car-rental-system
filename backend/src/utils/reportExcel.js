import ExcelJS from "exceljs";

function formatMoney(val) {
  return `$${Number(val || 0).toFixed(2)}`;
}

function addSummarySheet(workbook, title, report) {
  const sheet = workbook.addWorksheet(title);
  sheet.columns = [
    { header: "Metric", key: "metric", width: 35 },
    { header: "Value", key: "value", width: 25 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  headerRow.alignment = { horizontal: "center" };

  const rows = [
    { metric: "Report Period", value: `${new Date(report.period.from).toLocaleDateString()} - ${new Date(report.period.to).toLocaleDateString()}` },
    { metric: "Report Type", value: report.period.type },
    { metric: "Generated At", value: new Date(report.generatedAt).toLocaleString() },
    { metric: "New Bookings", value: report.newBookings },
    { metric: "Completed Rentals", value: report.completedRentals },
    { metric: "Total Revenue", value: formatMoney(report.revenue) },
    { metric: "New Customers", value: report.newCustomers },
  ];

  if (report.maintenanceCosts !== undefined) {
    rows.push({ metric: "Maintenance Costs", value: formatMoney(report.maintenanceCosts) });
  }

  rows.forEach((row) => sheet.addRow(row));
}

function addCarsByCategorySheet(workbook, report) {
  const sheet = workbook.addWorksheet("Cars by Category");
  sheet.columns = [
    { header: "Category", key: "category", width: 30 },
    { header: "Count", key: "count", width: 15 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  headerRow.alignment = { horizontal: "center" };

  report.carsByCategory.forEach((item) => sheet.addRow(item));
}

function addPaymentMethodsSheet(workbook, report) {
  const sheet = workbook.addWorksheet("Payment Methods");
  sheet.columns = [
    { header: "Method", key: "method", width: 25 },
    { header: "Transactions", key: "count", width: 18 },
    { header: "Total Amount", key: "total", width: 20 },
  ];

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF2563EB" } };
  headerRow.alignment = { horizontal: "center" };

  if (report.paymentMethods.length === 0) {
    sheet.addRow({ method: "No payments recorded", count: "-", total: "-" });
  } else {
    report.paymentMethods.forEach((item) => {
      sheet.addRow({ method: item.method, count: item.count, total: formatMoney(item.total) });
    });
  }
}

export async function generateReportExcel(report, periodType) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Mollash Cars Rental System";
  workbook.created = new Date();

  const title = `${periodType} Report`;
  addSummarySheet(workbook, "Summary", report);
  addCarsByCategorySheet(workbook, report);
  addPaymentMethodsSheet(workbook, report);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}
