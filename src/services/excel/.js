const ExcelJS = require("exceljs");
const path = require("path");
const prisma = require("@/provider/client");
const fs = require("fs");

const exportLogsExcel = async (req, res) => {
  try {
    // Fetch logs from database
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Initialize workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "System Administrator";
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("System Logs Report", {
      properties: { tabColor: { argb: "FF007ACC" } },
      views: [{ state: "frozen", ySplit: 6 }],
    });

    // Add logo if exists
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    if (fs.existsSync(logoPath)) {
      const imageId = workbook.addImage({
        filename: logoPath,
        extension: "png",
      });
      worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 200, height: 80 },
      });
    }

    // Report Header
    worksheet.mergeCells("A1:H1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "System Access Logs Report";
    titleCell.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: "FF003087" },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    worksheet.mergeCells("A2:H2");
    const subtitleCell = worksheet.getCell("A2");
    subtitleCell.value = `Generated on ${new Date().toLocaleString()}`;
    subtitleCell.font = { name: "Arial", size: 12, italic: true };
    subtitleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Summary Statistics
    worksheet.mergeCells("A4:B4");
    worksheet.getCell("A4").value = "Total Logs";
    worksheet.getCell("C4").value = logs.length;

    worksheet.mergeCells("A5:B5");
    worksheet.getCell("A5").value = "Period Covered";
    worksheet.getCell("C5").value =
      logs.length > 0
        ? `${new Date(
            Math.min(...logs.map((l) => new Date(l.createdAt)))
          ).toLocaleDateString()} to ${new Date().toLocaleDateString()}`
        : "N/A";

    // Style summary cells
    ["A4", "A5"].forEach((cell) => {
      worksheet.getCell(cell).font = { bold: true };
      worksheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFF0F4F8" },
      };
    });

    // Add empty row
    worksheet.addRow([]);

    // Add headers
    const headers = [
      "ID",
      "Method",
      "URL",
      "Status",
      "Response Time (ms)",
      "IP Address",
      "User Agent",
      "Created At",
    ];
    const headerRow = worksheet.addRow(headers);

    // Style headers
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007ACC" },
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add data rows
    logs.forEach((log, index) => {
      const row = worksheet.addRow([
        log.id,
        log.method,
        log.url,
        log.status,
        log.responseTime,
        log.ip,
        log.userAgent || "N/A",
        log.createdAt.toLocaleString(),
      ]);

      // Apply alternating row colors
      if (index % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF8FAFC" },
          };
        });
      }

      // Apply conditional formatting for status
      const statusCell = row.getCell(4);
      if (log.status >= 500) {
        statusCell.font = { color: { argb: "FFFF0000" }, bold: true };
      } else if (log.status >= 400) {
        statusCell.font = { color: { argb: "FFFFA500" }, bold: true };
      }
    });

    // Configure columns
    worksheet.columns = [
      { key: "id", width: 12 },
      { key: "method", width: 10 },
      { key: "url", width: 45 },
      { key: "status", width: 10 },
      { key: "responseTime", width: 15 },
      { key: "ip", width: 15 },
      { key: "userAgent", width: 50 },
      { key: "createdAt", width: 20 },
    ];

    // Apply number format to response time
    worksheet.getColumn("E").numFmt = "0.00";

    // Add borders to all data cells
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber > 6) {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          };
        });
      }
    });

    // Add footer
    const footerRow = worksheet.addRow(["End of Report"]);
    worksheet.mergeCells(`A${worksheet.rowCount}:H${worksheet.rowCount}`);
    footerRow.getCell(1).font = { italic: true, size: 10 };
    footerRow.getCell(1).alignment = { horizontal: "center" };

    // Set print area and page setup
    worksheet.pageSetup = {
      margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75 },
      printArea: `A1:H${worksheet.rowCount}`,
      orientation: "landscape",
      fitToPage: true,
    };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=System_Logs_Report_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    // Write and send the Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting logs to Excel:", err);
    res.status(500).send("Failed to export logs to Excel");
  }
};

module.exports = { exportLogsExcel };
