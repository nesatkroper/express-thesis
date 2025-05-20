const prisma = require("@/provider/client");

const transformBigInt = (obj) =>
  JSON.parse(
    JSON.stringify(obj, (key, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );

const select = async (req, res) => {
  try {
    const result = await prisma.$queryRaw`
      SELECT * FROM inventory
    `;

    if (!result || (Array.isArray(result) && !result.length))
      return res.status(404).json({ msg: "No data found" });

    const transformed = Array.isArray(result)
      ? result.map(transformBigInt)
      : transformBigInt(result);

    return res.status(200).json(transformed[0]);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = { select };
