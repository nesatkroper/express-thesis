const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

/**
 * Generic function to export any model data to Excel with Nun Kasekar branding
 * @param {Object} options - Configuration options
 * @param {Express.Request} options.req - Express request object
 * @param {Express.Response} options.res - Express response object
 * @param {string} options.modelName - Name of the model being exported (e.g., "Customer", "Employee")
 * @param {Array} options.data - Array of data objects to export
 * @param {Object} options.schema - Optional schema object defining column types and formatting
 */
const exportModelToExcel = async ({
  req,
  res,
  modelName,
  data,
  schema = null,
}) => {
  try {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("No data provided for export");
    }

    // Create workbook with metadata
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Nun Kasekar Analytics System";
    workbook.lastModifiedBy = "Automated Export System";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Set custom properties with company info
    workbook.properties.company = "Nun Kasekar";
    workbook.properties.title = `Nun Kasekar ${modelName} Data Export`;
    workbook.properties.subject = `${modelName} Data Export`;
    workbook.properties.keywords = `${modelName.toLowerCase()}, data, export, cambodia`;
    workbook.properties.category = "Reports";
    workbook.properties.description = `Export of ${modelName} data for Nun Kasekar`;
    workbook.properties.manager = "Nun Kasekar Management";

    // Define custom colors for consistent branding - Cambodian inspired
    const COLORS = {
      primary: "FF00205B", // Deep blue (inspired by Cambodian royal blue)
      secondary: "FF5B9BD5", // Light blue
      accent1: "FFED1C24", // Red (from Cambodian flag)
      accent2: "FFA5A5A5", // Gray
      accent3: "FF70AD47", // Green
      accent4: "FFFF0000", // Red
      accent5: "FFFFC000", // Gold/Yellow (from Cambodian temples)
      lightBg1: "FFF2F2F2", // Light gray
      lightBg2: "FFE6F0FF", // Very light blue
      darkText: "FF333333", // Dark gray for text
      lightText: "FFFFFFFF", // White for text on dark backgrounds
      cambodiaRed: "FFED1C24", // Red from Cambodian flag
      cambodiaBlue: "FF00205B", // Blue inspired by Cambodian royal colors
      gold: "FFFFD700", // Gold for Cambodian temple inspiration
    };

    // ===== RAW DATA WORKSHEET =====
    const dataSheet = workbook.addWorksheet("Raw Data", {
      properties: { tabColor: { argb: COLORS.cambodiaRed } },
      views: [{ state: "frozen", ySplit: 7, xSplit: 0 }], // Freeze header rows
    });

    // Add company header with Cambodian styling
    dataSheet.mergeCells("A1:Z1"); // Merge across all potential columns
    const companyCell = dataSheet.getCell("A1");
    companyCell.value = "NUN KASEKAR";
    companyCell.font = {
      name: "Arial",
      size: 28,
      bold: true,
      color: { argb: COLORS.gold },
    };
    companyCell.alignment = { vertical: "middle", horizontal: "center" };
    companyCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.cambodiaBlue },
    };
    dataSheet.getRow(1).height = 50;

    // Add location
    dataSheet.mergeCells("A2:Z2");
    const locationCell = dataSheet.getCell("A2");
    locationCell.value = "CAMBODIA";
    locationCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: COLORS.lightText },
    };
    locationCell.alignment = { vertical: "middle", horizontal: "center" };
    locationCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.cambodiaRed },
    };
    dataSheet.getRow(2).height = 30;

    // Add report title
    dataSheet.mergeCells("A3:Z3");
    const reportTitleCell = dataSheet.getCell("A3");
    reportTitleCell.value = `${modelName.toUpperCase()} DATA EXPORT`;
    reportTitleCell.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: COLORS.cambodiaBlue },
    };
    reportTitleCell.alignment = { vertical: "middle", horizontal: "center" };
    reportTitleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg2 },
    };
    dataSheet.getRow(3).height = 30;

    // Add decorative border inspired by Cambodian temple patterns
    for (let col = 1; col <= 26; col++) {
      // Up to column Z
      const borderCell = dataSheet.getCell(4, col);
      borderCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.gold },
      };
      borderCell.border = {
        top: { style: "medium", color: { argb: COLORS.cambodiaRed } },
        bottom: { style: "medium", color: { argb: COLORS.cambodiaRed } },
      };
    }
    dataSheet.getRow(4).height = 8;

    // Add report metadata
    dataSheet.mergeCells("A5:M5");
    dataSheet.getCell("A5").value = `Generated: ${new Date().toLocaleString()}`;
    dataSheet.getCell("A5").font = {
      italic: true,
      color: { argb: COLORS.darkText },
    };

    dataSheet.mergeCells("N5:Z5");
    dataSheet.getCell("N5").value = `Total Records: ${data.length}`;
    dataSheet.getCell("N5").font = {
      bold: true,
      color: { argb: COLORS.darkText },
    };
    dataSheet.getCell("N5").alignment = { horizontal: "right" };

    // Add another decorative border
    for (let col = 1; col <= 26; col++) {
      const borderCell = dataSheet.getCell(6, col);
      borderCell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.gold },
      };
      borderCell.border = {
        top: { style: "medium", color: { argb: COLORS.cambodiaRed } },
        bottom: { style: "medium", color: { argb: COLORS.cambodiaRed } },
      };
    }
    dataSheet.getRow(6).height = 8;

    // Dynamically determine columns from the first data object
    const sampleData = data[0];
    const columns = Object.keys(sampleData).map((key) => {
      // Determine column width based on key name length and data type
      let width = Math.max(key.length * 1.5, 12);

      // Adjust width based on data type
      const value = sampleData[key];
      if (typeof value === "string" && value.length > 20) {
        width = Math.min(50, value.length * 0.8); // Cap at 50
      } else if (key.toLowerCase().includes("id")) {
        width = 36; // UUID width
      } else if (
        key.toLowerCase().includes("date") ||
        key.toLowerCase().includes("time")
      ) {
        width = 22; // Date width
      }

      return {
        header: formatHeader(key),
        key,
        width,
      };
    });

    // Add header row with custom styling
    const headerRow = dataSheet.addRow(columns.map((col) => col.header));
    headerRow.font = {
      name: "Arial",
      bold: true,
      color: { argb: COLORS.lightText },
      size: 12,
    };
    headerRow.height = 35;

    // Style header cells with gradient-like effect
    headerRow.eachCell((cell, colNumber) => {
      // Create a gradient-like effect with slightly different shades
      const baseColor = COLORS.cambodiaBlue;
      const shade = colNumber % 2 === 0 ? "FF001F52" : baseColor; // Slightly different shade for alternating columns

      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: shade },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "medium", color: { argb: COLORS.gold } },
        bottom: { style: "medium", color: { argb: COLORS.gold } },
        left: { style: "thin", color: { argb: COLORS.gold } },
        right: { style: "thin", color: { argb: COLORS.gold } },
      };
    });

    // Set column widths
    columns.forEach((col, index) => {
      dataSheet.getColumn(index + 1).width = col.width;
    });

    // Add data with enhanced conditional formatting
    data.forEach((item, index) => {
      // Prepare row data
      const rowData = columns.map((col) => {
        const value = item[col.key];

        // Format dates if needed
        if (value instanceof Date) {
          return value;
        } else if (typeof value === "string" && isISODate(value)) {
          return new Date(value);
        }

        return value;
      });

      const row = dataSheet.addRow(rowData);

      // Set row height for better readability
      row.height = 22;

      // Add zebra striping with subtle colors
      if (index % 2 === 0) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.lightBg1 },
          };
        });
      } else {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFFFF" }, // White
          };
        });
      }

      // Add borders to all cells
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };

        // Add vertical alignment
        cell.alignment = { ...cell.alignment, vertical: "middle" };
      });

      // Apply special formatting based on column types
      row.eachCell((cell, colNumber) => {
        const columnKey = columns[colNumber - 1].key.toLowerCase();

        // Format IDs (highlight primary keys)
        if (columnKey.endsWith("id")) {
          cell.font = { bold: columnKey === modelName.toLowerCase() + "id" };
          cell.alignment = { horizontal: "center" };

          // If it's the primary key, add special styling
          if (columnKey === modelName.toLowerCase() + "id") {
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFEAF1FB" }, // Very light blue
            };
          }
        }

        // Format status fields
        else if (columnKey === "status") {
          cell.alignment = { horizontal: "center" };

          // Color-code status values
          const status = String(cell.value).toLowerCase();
          if (status === "active") {
            cell.font = { color: { argb: COLORS.accent3 }, bold: true }; // Green
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFE6F5E6" }, // Light green background
            };
          } else if (status === "inactive" || status === "disabled") {
            cell.font = { color: { argb: COLORS.accent4 }, bold: true }; // Red
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFAE6E6" }, // Light red background
            };
          } else if (status === "pending") {
            cell.font = { color: { argb: COLORS.accent5 }, bold: true }; // Yellow/Gold
            cell.fill = {
              type: "pattern",
              pattern: "solid",
              fgColor: { argb: "FFFFF9E6" }, // Light yellow background
            };
          }
        }

        // Format date fields
        else if (
          columnKey.includes("date") ||
          columnKey.includes("time") ||
          columnKey === "createdat" ||
          columnKey === "updatedat"
        ) {
          if (cell.value instanceof Date) {
            cell.numFmt = "yyyy-mm-dd hh:mm:ss";
            cell.alignment = { horizontal: "center" };
            cell.font = { italic: true };
          }
        }

        // Format email fields
        else if (columnKey.includes("email")) {
          cell.font = { color: { argb: COLORS.secondary }, underline: true };
          cell.alignment = { horizontal: "left" };
        }

        // Format boolean fields
        else if (typeof cell.value === "boolean") {
          cell.value = cell.value ? "Yes" : "No";
          cell.alignment = { horizontal: "center" };
          cell.font = { bold: true };
        }

        // Format number fields
        else if (typeof cell.value === "number") {
          if (
            columnKey.includes("price") ||
            columnKey.includes("amount") ||
            columnKey.includes("cost")
          ) {
            cell.numFmt = "$#,##0.00";
            cell.alignment = { horizontal: "right" };
          } else {
            cell.alignment = { horizontal: "center" };
          }
        }
      });
    });

    // Add autofilter
    dataSheet.autoFilter = {
      from: { row: 7, column: 1 },
      to: { row: 7, column: columns.length },
    };

    // Add Cambodian-inspired footer with company info
    const lastRow = data.length + 10; // Add some buffer
    dataSheet.mergeCells(`A${lastRow}:Z${lastRow}`);
    const footerCell = dataSheet.getCell(`A${lastRow}`);
    footerCell.value = "© Nun Kasekar, Cambodia";
    footerCell.font = {
      bold: true,
      color: { argb: COLORS.gold },
      size: 12,
    };
    footerCell.alignment = { horizontal: "center" };
    footerCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.cambodiaBlue },
    };
    dataSheet.getRow(lastRow).height = 30;

    // Add confidentiality notice
    dataSheet.mergeCells(`A${lastRow + 1}:Z${lastRow + 1}`);
    const confidentialCell = dataSheet.getCell(`A${lastRow + 1}`);
    confidentialCell.value =
      "CONFIDENTIAL: This report contains proprietary information of Nun Kasekar and is intended for internal use only.";
    confidentialCell.font = {
      italic: true,
      color: { argb: COLORS.darkText },
      size: 10,
    };
    confidentialCell.alignment = { horizontal: "center" };
    confidentialCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg1 },
    };

    // Add timestamp of report generation
    dataSheet.mergeCells(`A${lastRow + 2}:Z${lastRow + 2}`);
    const timestampCell = dataSheet.getCell(`A${lastRow + 2}`);
    timestampCell.value = `Report generated on ${new Date().toLocaleString()} by Nun Kasekar Analytics System`;
    timestampCell.font = {
      italic: true,
      color: { argb: COLORS.accent2 },
      size: 9,
    };
    timestampCell.alignment = { horizontal: "center" };

    // Add custom header/footer for printing
    dataSheet.headerFooter.oddHeader = `&L&B&"Arial,Bold"&16Nun Kasekar&C&G&R&D`;
    dataSheet.headerFooter.oddFooter = `&L&D&C&P of &N&R&"Arial"Nun Kasekar, Cambodia`;

    // Set print area and options
    dataSheet.pageSetup = {
      orientation: "landscape",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9, // A4
      horizontalCentered: true,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
    };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=nun_kasekar_${modelName.toLowerCase()}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    // Send the Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(`Error exporting ${modelName} to Excel:`, err);
    res
      .status(500)
      .send(`Failed to export ${modelName} to Excel: ${err.message}`);
  }
};

// Helper function to format header names
function formatHeader(key) {
  // Convert camelCase or snake_case to Title Case with spaces
  return (
    key
      // Insert a space before all caps and uppercase the first character
      .replace(/([A-Z])/g, " $1")
      // Replace underscores with spaces
      .replace(/_/g, " ")
      // Uppercase first character of each word
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1))
      // Trim any leading spaces
      .trim()
  );
}

// Helper function to check if a string is an ISO date
function isISODate(str) {
  if (typeof str !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z?$/.test(str);
}

module.exports = { exportModelToExcel };
