const prisma = require("@/provider/client");
const ExcelJS = require("exceljs");

const exportExcel = async (req, res) => {
  try {
    const carts = await prisma.cart.findMany({
      include: { product: true },
    });

    if (carts.length === 0) {
      return res.status(404).json({ message: "No data found" });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Cart Data");

    worksheet.addRow([]);

    worksheet.columns = [
      { header: "Cart ID", key: "cart_id", width: 12 },
      { header: "Auth ID", key: "auth_id", width: 12 },
      { header: "Product ID", key: "product_id", width: 12 },
      { header: "Product Name", key: "product_name", width: 30 },
      { header: "Quantity", key: "quantity", width: 15 },
      { header: "Created At", key: "created_at", width: 25 },
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFF" } };
    worksheet.getRow(1).alignment = {
      vertical: "middle",
      horizontal: "center",
    };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "4F81BD" },
    };

    carts.forEach((item) => {
      const row = worksheet.addRow({
        cart_id: item.cart_id || 0,
        auth_id: item.auth_id || 0,
        product_id: item.product_id || 0,
        product_name: item.product?.product_name || "Unknown",
        quantity: item.quantity || 0,
        created_at: formatDate(item.created_at),
      });

      row.eachCell((cell, colNumber) => {
        if (colNumber !== 6) {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }
      });
    });

    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    worksheet.getCell("A1").alignment = {
      vertical: "middle",
      horizontal: "center",
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=cart.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting data:", error);
    res.status(500).json({ error: "Failed to export data" });
  }
};

const formatDate = (date) => {
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  };
  return new Date(date).toLocaleString("en-GB", options);
};

module.exports = { exportExcel };
