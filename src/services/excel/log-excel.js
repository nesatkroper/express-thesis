const ExcelJS = require("exceljs");
const path = require("path");
const prisma = require("@/provider/client");
const fs = require("fs");

const exportLogsExcel = async (req, res) => {
  try {
    // Fetch all logs
    const logs = await prisma.log.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Create workbook with metadata
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Nun Kasekar Analytics System";
    workbook.lastModifiedBy = "Automated Export System";
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.properties.date1904 = false;

    // Set custom properties with company info
    workbook.properties.company = "Nun Kasekar";
    workbook.properties.title = "Nun Kasekar System Logs Analytics Report";
    workbook.properties.subject = "Web Traffic Analysis";
    workbook.properties.keywords =
      "logs, analytics, performance, monitoring, cambodia";
    workbook.properties.category = "Reports";
    workbook.properties.description =
      "Comprehensive analysis of system logs and performance metrics for Nun Kasekar";
    workbook.properties.manager = "Nun Kasekar Management";

    // Define custom colors for consistent branding
    // Using colors inspired by Cambodian flag and cultural elements
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

    // ===== DASHBOARD WORKSHEET =====
    const dashboardSheet = workbook.addWorksheet("Dashboard", {
      properties: { tabColor: { argb: COLORS.primary } },
      pageSetup: {
        paperSize: 9, // A4
        orientation: "landscape",
        fitToPage: true,
        printTitlesRow: "1:5",
        margins: {
          left: 0.7,
          right: 0.7,
          top: 0.75,
          bottom: 0.75,
          header: 0.3,
          footer: 0.3,
        },
      },
    });

    // Add company logo
    const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
    if (fs.existsSync(logoPath)) {
      const imageId = workbook.addImage({
        filename: logoPath,
        extension: "png",
      });

      dashboardSheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 220, height: 60 },
      });
    }

    // Add report title
    dashboardSheet.mergeCells("C1:J2");
    const titleCell = dashboardSheet.getCell("C1");
    titleCell.value = "SYSTEM LOGS ANALYTICS REPORT";
    titleCell.font = {
      name: "Arial",
      size: 24,
      bold: true,
      color: { argb: COLORS.primary },
    };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };

    // Add report date range
    dashboardSheet.mergeCells("C3:J3");
    const dateRangeCell = dashboardSheet.getCell("C3");
    const oldestLog =
      logs.length > 0 ? new Date(logs[logs.length - 1].createdAt) : new Date();
    const newestLog =
      logs.length > 0 ? new Date(logs[0].createdAt) : new Date();

    dateRangeCell.value = `Report Period: ${oldestLog.toLocaleDateString()} to ${newestLog.toLocaleDateString()}`;
    dateRangeCell.font = {
      name: "Arial",
      size: 12,
      italic: true,
      color: { argb: COLORS.accent2 },
    };
    dateRangeCell.alignment = { horizontal: "center" };

    // Add horizontal separator
    for (let col = 1; col <= 10; col++) {
      const cell = dashboardSheet.getCell(4, col);
      cell.border = {
        bottom: { style: "medium", color: { argb: COLORS.primary } },
      };
    }

    // Calculate key metrics
    const totalRequests = logs.length;
    const successRequests = logs.filter(
      (log) => log.status >= 200 && log.status < 300
    ).length;
    const redirectRequests = logs.filter(
      (log) => log.status >= 300 && log.status < 400
    ).length;
    const clientErrorRequests = logs.filter(
      (log) => log.status >= 400 && log.status < 500
    ).length;
    const serverErrorRequests = logs.filter((log) => log.status >= 500).length;
    const avgResponseTime =
      logs.reduce((sum, log) => sum + log.responseTime, 0) /
      (totalRequests || 1);

    // Get unique IPs and URLs
    const uniqueIPs = new Set(logs.map((log) => log.ip)).size;
    const uniqueURLs = new Set(logs.map((log) => log.url)).size;

    // Count requests by method
    const methodCounts = logs.reduce((acc, log) => {
      acc[log.method] = (acc[log.method] || 0) + 1;
      return acc;
    }, {});

    // Add KPI boxes
    const kpiRow = 6;
    const kpiHeight = 4;
    const kpiBoxes = [
      {
        title: "Total Requests",
        value: totalRequests.toLocaleString(),
        color: COLORS.primary,
      },
      {
        title: "Success Rate",
        value: `${((successRequests / totalRequests) * 100).toFixed(1)}%`,
        color: COLORS.accent3,
      },
      {
        title: "Avg Response Time",
        value: `${avgResponseTime.toFixed(2)} ms`,
        color: COLORS.secondary,
      },
      {
        title: "Error Rate",
        value: `${(
          ((clientErrorRequests + serverErrorRequests) / totalRequests) *
          100
        ).toFixed(1)}%`,
        color: COLORS.accent4,
      },
    ];

    kpiBoxes.forEach((kpi, index) => {
      const col = index * 3 + 1;

      // Merge cells for KPI box
      dashboardSheet.mergeCells(kpiRow, col, kpiRow + kpiHeight - 1, col + 2);

      // Add KPI content
      const cell = dashboardSheet.getCell(kpiRow, col);
      cell.value = {
        richText: [
          {
            text: `${kpi.title}\n\n`,
            font: { size: 12, bold: true, color: { argb: COLORS.lightText } },
          },
          {
            text: kpi.value,
            font: { size: 24, bold: true, color: { argb: COLORS.lightText } },
          },
        ],
      };

      // Style KPI box
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: kpi.color },
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

    // Set row height for KPI boxes
    dashboardSheet.getRow(kpiRow).height = 100;

    // Add section title for charts
    dashboardSheet.mergeCells(
      `A${kpiRow + kpiHeight + 1}:J${kpiRow + kpiHeight + 1}`
    );
    const chartTitleCell = dashboardSheet.getCell(`A${kpiRow + kpiHeight + 1}`);
    chartTitleCell.value = "REQUEST ANALYTICS";
    chartTitleCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: COLORS.primary },
    };
    chartTitleCell.alignment = { vertical: "middle", horizontal: "center" };
    chartTitleCell.border = {
      bottom: { style: "medium", color: { argb: COLORS.primary } },
    };

    // Add placeholder for charts (in a real implementation, you would use a charting library)
    // Since ExcelJS doesn't support charts directly, we'll create placeholders with instructions
    const chartRow = kpiRow + kpiHeight + 2;

    // Status distribution chart placeholder
    dashboardSheet.mergeCells(chartRow, 1, chartRow + 10, 5);
    const statusChartCell = dashboardSheet.getCell(chartRow, 1);
    statusChartCell.value =
      "STATUS CODE DISTRIBUTION\n\n[Pie chart showing distribution of status codes would appear here]";
    statusChartCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    statusChartCell.font = { italic: true };
    statusChartCell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    statusChartCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg1 },
    };

    // Method distribution chart placeholder
    dashboardSheet.mergeCells(chartRow, 6, chartRow + 10, 10);
    const methodChartCell = dashboardSheet.getCell(chartRow, 6);
    methodChartCell.value =
      "HTTP METHOD DISTRIBUTION\n\n[Bar chart showing distribution of HTTP methods would appear here]";
    methodChartCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    methodChartCell.font = { italic: true };
    methodChartCell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    methodChartCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg1 },
    };

    // Add executive summary
    const summaryRow = chartRow + 12;
    dashboardSheet.mergeCells(`A${summaryRow}:J${summaryRow}`);
    const summaryTitleCell = dashboardSheet.getCell(`A${summaryRow}`);
    summaryTitleCell.value = "EXECUTIVE SUMMARY";
    summaryTitleCell.font = {
      name: "Arial",
      size: 14,
      bold: true,
      color: { argb: COLORS.primary },
    };
    summaryTitleCell.alignment = { horizontal: "left" };

    // Add summary content
    dashboardSheet.mergeCells(`A${summaryRow + 1}:J${summaryRow + 5}`);
    const summaryCell = dashboardSheet.getCell(`A${summaryRow + 1}`);

    // Create a dynamic summary based on the data
    let summaryText = `This report analyzes ${totalRequests.toLocaleString()} web requests from ${uniqueIPs} unique IP addresses accessing ${uniqueURLs} different URLs. `;

    if (successRequests / totalRequests > 0.95) {
      summaryText +=
        "The system is performing exceptionally well with a success rate above 95%. ";
    } else if (successRequests / totalRequests > 0.9) {
      summaryText +=
        "The system is performing well with a success rate above 90%. ";
    } else {
      summaryText += `The system's success rate is ${(
        (successRequests / totalRequests) *
        100
      ).toFixed(1)}%, which requires attention. `;
    }

    if (avgResponseTime < 100) {
      summaryText += "Response times are excellent, averaging below 100ms. ";
    } else if (avgResponseTime < 300) {
      summaryText += "Response times are good, averaging below 300ms. ";
    } else {
      summaryText += `Response times are averaging ${avgResponseTime.toFixed(
        0
      )}ms, which may indicate performance issues. `;
    }

    if (serverErrorRequests > 0) {
      summaryText += `There were ${serverErrorRequests} server errors detected which should be investigated. `;
    }

    summaryText += `The most common request method was ${
      Object.entries(methodCounts).sort((a, b) => b[1] - a[1])[0][0]
    }.`;

    summaryCell.value = summaryText;
    summaryCell.alignment = {
      vertical: "top",
      horizontal: "left",
      wrapText: true,
    };
    summaryCell.font = {
      name: "Arial",
      size: 11,
      color: { argb: COLORS.darkText },
    };
    summaryCell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    summaryCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg2 },
    };

    // Add navigation instructions
    dashboardSheet.mergeCells(`A${summaryRow + 7}:J${summaryRow + 7}`);
    const navCell = dashboardSheet.getCell(`A${summaryRow + 7}`);
    navCell.value =
      "For detailed data analysis, please see the 'Data Analysis' and 'Raw Data' tabs.";
    navCell.font = {
      name: "Arial",
      size: 11,
      italic: true,
      color: { argb: COLORS.accent2 },
    };
    navCell.alignment = { horizontal: "center" };

    // ===== DATA ANALYSIS WORKSHEET =====
    const analysisSheet = workbook.addWorksheet("Data Analysis", {
      properties: { tabColor: { argb: COLORS.secondary } },
      views: [{ state: "frozen", ySplit: 1, xSplit: 0 }],
    });

    // Add header row
    const analysisHeaders = [
      "Status Code",
      "Count",
      "% of Total",
      "Method",
      "Count",
      "% of Total",
      "Top URLs",
      "Count",
      "% of Total",
    ];

    const analysisHeaderRow = analysisSheet.addRow(analysisHeaders);
    analysisHeaderRow.font = { bold: true, color: { argb: COLORS.lightText } };
    analysisHeaderRow.height = 30;

    // Style header cells
    analysisHeaderRow.eachCell((cell, colNumber) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.primary },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Group logs by status code
    const statusCounts = logs.reduce((acc, log) => {
      const status = log.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Sort status codes
    const sortedStatusCodes = Object.entries(statusCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([status, count]) => ({
        status,
        count,
        percentage: (count / totalRequests) * 100,
      }));

    // Group logs by URL
    const urlCounts = logs.reduce((acc, log) => {
      const url = log.url;
      acc[url] = (acc[url] || 0) + 1;
      return acc;
    }, {});

    // Get top URLs
    const topUrls = Object.entries(urlCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([url, count]) => ({
        url,
        count,
        percentage: (count / totalRequests) * 100,
      }));

    // Group logs by method
    const methodStats = Object.entries(methodCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([method, count]) => ({
        method,
        count,
        percentage: (count / totalRequests) * 100,
      }));

    // Add data rows
    const maxRows = Math.max(
      sortedStatusCodes.length,
      methodStats.length,
      topUrls.length
    );

    for (let i = 0; i < maxRows; i++) {
      const rowData = [];

      // Status data
      if (i < sortedStatusCodes.length) {
        rowData.push(
          sortedStatusCodes[i].status,
          sortedStatusCodes[i].count,
          `${sortedStatusCodes[i].percentage.toFixed(1)}%`
        );
      } else {
        rowData.push("", "", "");
      }

      // Method data
      if (i < methodStats.length) {
        rowData.push(
          methodStats[i].method,
          methodStats[i].count,
          `${methodStats[i].percentage.toFixed(1)}%`
        );
      } else {
        rowData.push("", "", "");
      }

      // URL data
      if (i < topUrls.length) {
        rowData.push(
          topUrls[i].url,
          topUrls[i].count,
          `${topUrls[i].percentage.toFixed(1)}%`
        );
      } else {
        rowData.push("", "", "");
      }

      const dataRow = analysisSheet.addRow(rowData);

      // Style the row
      dataRow.eachCell((cell, colNumber) => {
        // Add borders
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };

        // Center counts and percentages
        if (colNumber % 3 === 2 || colNumber % 3 === 0) {
          cell.alignment = { horizontal: "center" };
        }

        // Add alternating row colors
        if (i % 2 === 0) {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.lightBg1 },
          };
        }

        // Color status codes
        if (colNumber === 1 && cell.value) {
          const status = Number.parseInt(cell.value);
          if (status >= 200 && status < 300) {
            cell.font = { color: { argb: COLORS.accent3 } }; // Green for 2xx
          } else if (status >= 300 && status < 400) {
            cell.font = { color: { argb: COLORS.secondary } }; // Blue for 3xx
          } else if (status >= 400 && status < 500) {
            cell.font = { color: { argb: COLORS.accent5 } }; // Yellow for 4xx
          } else if (status >= 500) {
            cell.font = { color: { argb: COLORS.accent4 } }; // Red for 5xx
          }
        }

        // Bold HTTP methods
        if (colNumber === 4 && cell.value) {
          cell.font = { bold: true };
        }
      });
    }

    // Set column widths
    analysisSheet.getColumn(1).width = 15;
    analysisSheet.getColumn(2).width = 10;
    analysisSheet.getColumn(3).width = 12;
    analysisSheet.getColumn(4).width = 15;
    analysisSheet.getColumn(5).width = 10;
    analysisSheet.getColumn(6).width = 12;
    analysisSheet.getColumn(7).width = 50;
    analysisSheet.getColumn(8).width = 10;
    analysisSheet.getColumn(9).width = 12;

    // Add autofilter
    analysisSheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: 9 },
    };

    // ===== RAW DATA WORKSHEET =====
    const dataSheet = workbook.addWorksheet("Raw Data", {
      properties: { tabColor: { argb: COLORS.cambodiaRed } },
      views: [{ state: "frozen", ySplit: 7, xSplit: 0 }], // Freeze more rows to keep header visible
    });

    // Add company header with Cambodian styling
    dataSheet.mergeCells("A1:H1");
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
    dataSheet.mergeCells("A2:H2");
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
    dataSheet.mergeCells("A3:H3");
    const reportTitleCell = dataSheet.getCell("A3");
    reportTitleCell.value = "SYSTEM LOGS DETAILED REPORT";
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
    for (let col = 1; col <= 8; col++) {
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
    dataSheet.mergeCells("A5:D5");
    dataSheet.getCell("A5").value = `Generated: ${new Date().toLocaleString()}`;
    dataSheet.getCell("A5").font = {
      italic: true,
      color: { argb: COLORS.darkText },
    };

    dataSheet.mergeCells("E5:H5");
    dataSheet.getCell("E5").value = `Total Records: ${logs.length}`;
    dataSheet.getCell("E5").font = {
      bold: true,
      color: { argb: COLORS.darkText },
    };
    dataSheet.getCell("E5").alignment = { horizontal: "right" };

    // Add another decorative border
    for (let col = 1; col <= 8; col++) {
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

    // Define columns with custom styles
    const columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "METHOD", key: "method", width: 12 },
      { header: "URL", key: "url", width: 50 },
      { header: "STATUS", key: "status", width: 12 },
      { header: "RESPONSE TIME", key: "responseTime", width: 18 },
      { header: "IP ADDRESS", key: "ip", width: 15 },
      { header: "USER AGENT", key: "userAgent", width: 50 },
      { header: "TIMESTAMP", key: "createdAt", width: 22 },
    ];

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
    logs.forEach((log, index) => {
      const formattedDate = new Date(log.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const row = dataSheet.addRow([
        log.id,
        log.method,
        log.url,
        log.status,
        log.responseTime,
        log.ip,
        log.userAgent || "N/A",
        formattedDate,
      ]);

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

      // Add borders to all cells with Cambodian-inspired colors
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

      // Format ID cell with special styling
      const idCell = row.getCell(1);
      idCell.font = { bold: true };
      idCell.alignment = { horizontal: "center" };

      // Format method cell with custom styling
      const methodCell = row.getCell(2);
      methodCell.alignment = { horizontal: "center" };

      // Create method badges with background colors
      if (log.method) {
        let methodColor;
        const textColor = COLORS.lightText;

        switch (log.method) {
          case "GET":
            methodColor = COLORS.accent3; // Green
            break;
          case "POST":
            methodColor = COLORS.secondary; // Blue
            break;
          case "PUT":
          case "PATCH":
            methodColor = COLORS.accent1; // Orange/Red
            break;
          case "DELETE":
            methodColor = COLORS.accent4; // Red
            break;
          default:
            methodColor = COLORS.accent2; // Gray
        }

        methodCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: methodColor },
        };

        methodCell.font = {
          bold: true,
          color: { argb: textColor },
        };

        // Add rounded corner effect with borders
        methodCell.border = {
          top: { style: "thin", color: { argb: methodColor } },
          bottom: { style: "thin", color: { argb: methodColor } },
          left: { style: "thin", color: { argb: methodColor } },
          right: { style: "thin", color: { argb: methodColor } },
        };
      }

      // Format status code cell with custom styling
      const statusCell = row.getCell(4);
      statusCell.alignment = { horizontal: "center" };

      // Create status badges with background colors
      if (log.status) {
        let statusColor;
        let textColor = COLORS.lightText;

        if (log.status >= 200 && log.status < 300) {
          statusColor = COLORS.accent3; // Green for 2xx
        } else if (log.status >= 300 && log.status < 400) {
          statusColor = COLORS.secondary; // Blue for 3xx
        } else if (log.status >= 400 && log.status < 500) {
          statusColor = COLORS.accent5; // Yellow for 4xx
          textColor = COLORS.darkText; // Dark text on yellow background
        } else if (log.status >= 500) {
          statusColor = COLORS.accent4; // Red for 5xx
        }

        statusCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: statusColor },
        };

        statusCell.font = {
          bold: true,
          color: { argb: textColor },
        };

        // Add rounded corner effect with borders
        statusCell.border = {
          top: { style: "thin", color: { argb: statusColor } },
          bottom: { style: "thin", color: { argb: statusColor } },
          left: { style: "thin", color: { argb: statusColor } },
          right: { style: "thin", color: { argb: statusColor } },
        };
      }

      // Format response time cell with gradient colors
      const responseTimeCell = row.getCell(5);
      responseTimeCell.alignment = { horizontal: "center" };

      // Apply color gradient based on response time
      if (log.responseTime !== undefined) {
        let responseTimeColor;

        if (log.responseTime < 100) {
          responseTimeColor = COLORS.accent3; // Green for fast
        } else if (log.responseTime < 300) {
          responseTimeColor = "FF8BC34A"; // Light green
        } else if (log.responseTime < 500) {
          responseTimeColor = COLORS.accent5; // Yellow
        } else if (log.responseTime < 1000) {
          responseTimeColor = COLORS.accent1; // Orange
        } else {
          responseTimeColor = COLORS.accent4; // Red for slow
        }

        responseTimeCell.font = {
          bold: true,
          color: { argb: COLORS.darkText },
        };

        responseTimeCell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: responseTimeColor },
        };

        // Add custom number format with ms unit
        responseTimeCell.numFmt = '0.00 "ms"';
      }

      // Format IP address cell
      const ipCell = row.getCell(6);
      ipCell.alignment = { horizontal: "center" };
      ipCell.font = { family: 2 }; // Monospace font for IP addresses

      // Format timestamp with custom date format
      const timestampCell = row.getCell(8);
      timestampCell.alignment = { horizontal: "center" };
      timestampCell.font = { italic: true };
    });

    // Add autofilter with dropdown menus
    dataSheet.autoFilter = {
      from: { row: 7, column: 1 },
      to: { row: 7, column: 8 },
    };

    // Add data validation for filtering
    dataSheet.getColumn(2).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"GET,POST,PUT,PATCH,DELETE,OPTIONS"'],
    };

    dataSheet.getColumn(4).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ['"200,201,204,301,302,400,401,403,404,500,502,503"'],
    };

    // Add Cambodian-inspired footer with company info
    const lastRow = logs.length + 10; // Add some buffer
    dataSheet.mergeCells(`A${lastRow}:H${lastRow}`);
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
    dataSheet.mergeCells(`A${lastRow + 1}:H${lastRow + 1}`);
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
    dataSheet.mergeCells(`A${lastRow + 2}:H${lastRow + 2}`);
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

    // ===== PERFORMANCE METRICS WORKSHEET =====
    const perfSheet = workbook.addWorksheet("Performance Metrics", {
      properties: { tabColor: { argb: COLORS.accent3 } },
    });

    // Add header
    perfSheet.mergeCells("A1:H1");
    const perfTitleCell = perfSheet.getCell("A1");
    perfTitleCell.value = "RESPONSE TIME ANALYSIS";
    perfTitleCell.font = {
      name: "Arial",
      size: 16,
      bold: true,
      color: { argb: COLORS.primary },
    };
    perfTitleCell.alignment = { vertical: "middle", horizontal: "center" };
    perfTitleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg2 },
    };
    perfSheet.getRow(1).height = 30;

    // Add performance metrics
    const perfMetrics = [
      {
        label: "Average Response Time",
        value: `${avgResponseTime.toFixed(2)} ms`,
      },
      {
        label: "Minimum Response Time",
        value: `${Math.min(...logs.map((log) => log.responseTime))} ms`,
      },
      {
        label: "Maximum Response Time",
        value: `${Math.max(...logs.map((log) => log.responseTime))} ms`,
      },
      {
        label: "Median Response Time",
        value: `${calculateMedian(logs.map((log) => log.responseTime)).toFixed(
          2
        )} ms`,
      },
      {
        label: "90th Percentile",
        value: `${calculatePercentile(
          logs.map((log) => log.responseTime),
          90
        ).toFixed(2)} ms`,
      },
      {
        label: "95th Percentile",
        value: `${calculatePercentile(
          logs.map((log) => log.responseTime),
          95
        ).toFixed(2)} ms`,
      },
      {
        label: "99th Percentile",
        value: `${calculatePercentile(
          logs.map((log) => log.responseTime),
          99
        ).toFixed(2)} ms`,
      },
    ];

    // Add metrics to sheet
    perfMetrics.forEach((metric, index) => {
      const row = perfSheet.addRow([metric.label, metric.value]);
      row.getCell(1).font = { bold: true };
      row.height = 25;

      // Add alternating row colors
      if (index % 2 === 0) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.lightBg1 },
          };
        });
      }
    });

    // Add response time distribution table header
    perfSheet.addRow([]);
    const distHeaderRow = perfSheet.addRow([
      "Response Time Range",
      "Count",
      "Percentage",
    ]);
    distHeaderRow.font = { bold: true, color: { argb: COLORS.lightText } };
    distHeaderRow.height = 25;

    distHeaderRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.primary },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Create response time distribution ranges
    const ranges = [
      { min: 0, max: 100, label: "0-100 ms", color: COLORS.accent3 },
      { min: 101, max: 300, label: "101-300 ms", color: COLORS.secondary },
      { min: 301, max: 500, label: "301-500 ms", color: COLORS.accent5 },
      { min: 501, max: 1000, label: "501-1000 ms", color: COLORS.accent1 },
      {
        min: 1001,
        max: Number.POSITIVE_INFINITY,
        label: "> 1000 ms",
        color: COLORS.accent4,
      },
    ];

    // Count logs in each range
    const rangeCounts = ranges.map((range) => {
      const count = logs.filter(
        (log) => log.responseTime >= range.min && log.responseTime <= range.max
      ).length;

      return {
        label: range.label,
        count,
        percentage: (count / totalRequests) * 100,
        color: range.color,
      };
    });

    // Add range data
    rangeCounts.forEach((range, index) => {
      const row = perfSheet.addRow([
        range.label,
        range.count,
        `${range.percentage.toFixed(1)}%`,
      ]);

      row.getCell(1).font = { color: { argb: range.color }, bold: true };
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(3).alignment = { horizontal: "center" };

      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFE0E0E0" } },
          bottom: { style: "thin", color: { argb: "FFE0E0E0" } },
          left: { style: "thin", color: { argb: "FFE0E0E0" } },
          right: { style: "thin", color: { argb: "FFE0E0E0" } },
        };
      });

      // Add alternating row colors
      if (index % 2 === 0) {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: COLORS.lightBg1 },
          };
        });
      }
    });

    // Set column widths
    perfSheet.getColumn(1).width = 25;
    perfSheet.getColumn(2).width = 15;
    perfSheet.getColumn(3).width = 15;

    // Add placeholder for response time chart
    perfSheet.addRow([]);
    perfSheet.mergeCells("A15:C25");
    const chartCell = perfSheet.getCell("A15");
    chartCell.value =
      "RESPONSE TIME DISTRIBUTION\n\n[Bar chart showing distribution of response times would appear here]";
    chartCell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true,
    };
    chartCell.font = { italic: true };
    chartCell.border = {
      top: { style: "thin" },
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
    };
    chartCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.lightBg1 },
    };

    // Add footer to all sheets
    const sheets = [dashboardSheet, analysisSheet, dataSheet, perfSheet];
    sheets.forEach((sheet) => {
      // Add footer with page numbers
      sheet.headerFooter.oddFooter = `&L&B${workbook.properties.company}&C&D&T&R&P of &N`;

      // Add confidentiality notice
      const lastRow = sheet.lastRow ? sheet.lastRow.number + 2 : 50;
      sheet.mergeCells(`A${lastRow}:H${lastRow}`);
      const footerCell = sheet.getCell(`A${lastRow}`);
      footerCell.value =
        "CONFIDENTIAL: This report contains proprietary information and is intended for internal use only.";
      footerCell.font = {
        italic: true,
        color: { argb: COLORS.accent2 },
        size: 8,
      };
      footerCell.alignment = { horizontal: "center" };
    });

    // Set active sheet to Dashboard
    workbook.views = [
      {
        firstSheet: 0,
        activeTab: 0,
        visibility: "visible",
      },
    ];

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=nun_kasekar_logs_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );

    // Send the Excel file
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Error exporting logs to Excel:", err);
    res.status(500).send("Failed to export logs to Excel");
  }
};

// Helper functions for statistics
function calculateMedian(values) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

function calculatePercentile(values, percentile) {
  if (!values.length) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index];
}

module.exports = { exportLogsExcel };
