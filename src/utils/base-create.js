const prisma = require("@/lib/prisma");
const { modelSchemas } = require("./base-schema");
const { convertData } = require("./convert-data");

const baseCreate = async (
  model,
  data,
  options = {},
  verbose = false,
  clear = false
) => {
  if (!prisma[model]) throw new Error(`Prisma model "${model}" not found`);

  if (!modelSchemas[model])
    throw new Error(`Model schema for "${model}" not found`);

  return await prisma.$transaction(async (tx) => {
    try {
      // @Convert data within transaction
      const formattedData = convertData(data, modelSchemas[model]);

      // @Create record
      const createdRecord = await tx[model].create({ data: formattedData });

      // @Early return if no code generation needed
      if (!options.field || !options.idField || !options.prefix) {
        if (verbose) console.table(createdRecord);

        return createdRecord;
      }

      // @Validate ID field exists
      if (!createdRecord[options.idField]) {
        throw new Error(
          `ID field "${options.idField}" not found in created record`
        );
      }

      const safePrefix = options.prefix
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase();
      const numericPart = createdRecord[options.idField]
        .toString()
        .split("-")[0];
      const generatedCode = `${safePrefix}-${numericPart}`;

      // @Update record with generated code
      const updatedRecord = await tx[model].update({
        where: {
          [options.idField]: createdRecord[options.idField],
        },
        data: {
          [options.field]: generatedCode,
        },
      });

      if (verbose) console.table(updatedRecord);

      return updatedRecord;
    } catch (err) {
      console.error(`Transaction failed for model ${model}:`, {
        error: err.message,
        data,
        options,
      });
      throw err; // @This will automatically rollback the transaction
    }
  });
};

module.exports = {
  baseCreate,
};
