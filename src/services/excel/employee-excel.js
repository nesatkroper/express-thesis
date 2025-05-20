const ExcelJS = require("exceljs");
const path = require("path");
const prisma = require("@/provider/client");
const fs = require("fs");

const exportEmployeesExcel = async (req, res) => {
  try {
    const date = new Date();
    const employees = await prisma.employee.findMany({
      include: {
        department: true,
        position: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Employees");

    const logoPath = path.join(__dirname, "logo.png");
    const imageId = workbook.addImage({
      filename: logoPath,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 200, height: 80 },
    });

    worksheet.addRow([]);
    worksheet.addRow([]);
    worksheet.addRow([]);

    const headerRow = worksheet.addRow([
      "ID",
      "Name",
      "Email",
      "Department",
      "Position",
      "Joined Date",
    ]);

    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007ACC" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };
    });

    employees.forEach((emp) => {
      worksheet.addRow([
        emp.id,
        emp.name,
        emp.email,
        emp.department?.name || "",
        emp.position?.title || "",
        emp.createdAt.toISOString().split("T")[0],
      ]);
    });

    worksheet.columns.forEach((col) => {
      col.width = 20;
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=employees.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to export Excel");
  }
};

module.exports = { exportEmployeesExcel };
