const prisma = require("@/provider/client");
const { exportModelToExcel } = require("@/utils/base-export");

async function exportCity(req, res) {
  try {
    // Fetch City records from your database
    const cityRecords = await prisma.city.findMany({
      include: {
        state: true,
      },
    });

    // Format the data for export
    const formattedData = cityRecords.map((record) => ({
      cityId: record.cityId,
      stateId: record.stateId,
      name: record.name,
      state: record.state.name,
    }));

    // Export to Excel
    await exportModelToExcel({
      req,
      res,
      modelName: "City",
      data: formattedData,
    });
  } catch (error) {
    console.error("Error exporting City records:", error);
    res.status(500).send("Failed to export City records");
  }
}

module.exports = { exportCity };
