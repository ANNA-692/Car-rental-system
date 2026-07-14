import PDFDocument from "pdfkit";

function formatMoney(val) {
  return `$${Number(val || 0).toFixed(2)}`;
}

export function generateReportPdf(report, periodType) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).font("Helvetica-Bold").text(`Mollash Cars - ${periodType} Report`, { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(10).font("Helvetica").fillColor("#666666");
    doc.text(`Generated: ${new Date(report.generatedAt).toLocaleString()}`, { align: "center" });
    doc.text(
      `Period: ${new Date(report.period.from).toLocaleDateString()} - ${new Date(report.period.to).toLocaleDateString()}`,
      { align: "center" }
    );
    doc.moveDown(1);

    doc.fillColor("#000000");
    doc.fontSize(14).font("Helvetica-Bold").text("Summary");
    doc.moveDown(0.3);
    doc.strokeColor("#2563EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const summaryItems = [
      ["New Bookings", report.newBookings],
      ["Completed Rentals", report.completedRentals],
      ["Total Revenue", formatMoney(report.revenue)],
      ["New Customers", report.newCustomers],
    ];

    if (report.maintenanceCosts !== undefined) {
      summaryItems.push(["Maintenance Costs", formatMoney(report.maintenanceCosts)]);
    }

    summaryItems.forEach(([label, value]) => {
      doc.fontSize(11).font("Helvetica").text(label, 70, doc.y, { continued: true }).font("Helvetica-Bold").text(`    ${value}`);
    });

    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000000").text("Cars by Category");
    doc.moveDown(0.3);
    doc.strokeColor("#2563EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const catTableTop = doc.y;
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#2563EB");
    doc.text("Category", 70, catTableTop, { width: 250 });
    doc.text("Count", 320, catTableTop, { width: 100 });
    doc.moveDown(0.3);
    doc.strokeColor("#E5E7EB").lineWidth(0.5).moveTo(70, doc.y).lineTo(420, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font("Helvetica").fillColor("#000000");
    report.carsByCategory.forEach((item) => {
      doc.text(item.category, 70, doc.y, { width: 250, continued: true }).text(`${item.count}`, 320, doc.y - doc.heightOfString(item.category), { width: 100 });
      doc.moveDown(0.2);
    });

    doc.moveDown(1);
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#000000").text("Payment Methods");
    doc.moveDown(0.3);
    doc.strokeColor("#2563EB").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);

    const payTableTop = doc.y;
    doc.fontSize(10).font("Helvetica-Bold").fillColor("#2563EB");
    doc.text("Method", 70, payTableTop, { width: 150 });
    doc.text("Transactions", 220, payTableTop, { width: 100 });
    doc.text("Total Amount", 340, payTableTop, { width: 120 });
    doc.moveDown(0.3);
    doc.strokeColor("#E5E7EB").lineWidth(0.5).moveTo(70, doc.y).lineTo(460, doc.y).stroke();
    doc.moveDown(0.3);

    doc.font("Helvetica").fillColor("#000000");
    if (report.paymentMethods.length === 0) {
      doc.text("No payments recorded", 70, doc.y);
    } else {
      report.paymentMethods.forEach((item) => {
        const y = doc.y;
        doc.text(item.method || "N/A", 70, y, { width: 150 });
        doc.text(`${item.count}`, 220, y, { width: 100 });
        doc.text(formatMoney(item.total), 340, y, { width: 120 });
        doc.moveDown(0.2);
      });
    }

    doc.moveDown(2);
    doc.fontSize(8).font("Helvetica").fillColor("#999999").text("Mollash Cars Rental Management System", { align: "center" });

    doc.end();
  });
}
