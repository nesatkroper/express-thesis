const prisma = require("@/lib/prisma");

const baseDestroy = async (model, id, options = {}) => {
  // @Validate model exists
  if (!prisma[model]) {
    throw new Error(`Prisma model "${model}" not found`);
  }

  // @Determine ID field name
  const idField = options.idField || `${model}Id`;

  return await prisma.$transaction(async (tx) => {
    try {
      // @Check if record exists
      const record = await tx[model].findUnique({
        where: {
          [idField]: id,
        },
      });

      if (!record) {
        throw new Error(`${model} with ${idField}=${id} not found`);
      }

      // @Handle soft delete if configured and available
      if (options.softDelete && record.deletedAt === null) {
        if (verbose) console.log(`Soft deleting ${model} ${idField}=${id}`);

        return await tx[model].update({
          where: {
            [idField]: id,
          },
          data: {
            deletedAt: new Date(),
          },
        });
      }

      // @Perform hard delete
      if (options.verbose) console.log(`Deleting ${model} ${idField}=${id}`);

      const deletedRecord = await tx[model].delete({
        where: {
          [idField]: id,
        },
      });

      return deletedRecord;
    } catch (err) {
      console.error(`Error deleting ${model} ${idField}=${id}:`, {
        error: err.message,
        model,
        id,
        options,
      });
      throw err; // @This will trigger transaction rollback
    }
  });
};

module.exports = {
  baseDestroy,
};
