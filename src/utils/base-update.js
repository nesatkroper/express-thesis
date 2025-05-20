const fs = require("fs").promises;
const path = require("path");
const prisma = require("@/provider/client");
const { modelSchemas } = require("./base-schema");
const { convertData } = require("./convert-data");

const baseUpdate = async (model, id, data, file, uploadPath, options = {}) => {
  // @Validate model exists
  if (!prisma[model]) {
    throw new Error(`Prisma model "${model}" not found`);
  }
  if (!modelSchemas[model]) {
    throw new Error(`Model schema for "${model}" not found`);
  }

  // @Configure field names
  const idField = options.idField || `${model}Id`;
  const pictureField = options.pictureField || "picture";

  return await prisma.$transaction(async (tx) => {
    try {
      // @Convert and validate data
      const updateData = convertData(data, modelSchemas[model]);
      if (!updateData || typeof updateData !== "object") {
        throw new Error("Data conversion failed - invalid result");
      }

      // @Get existing record
      const existingRecord = await tx[model].findUnique({
        where: {
          [idField]: id,
        },
      });

      if (!existingRecord) {
        throw new Error(`${model} with ${idField}=${id} not found`);
      }

      // @Handle file upload if provided
      if (file && uploadPath) {
        const newFilename = path.basename(file.path);

        // @Delete old file if it exists
        if (existingRecord[pictureField]) {
          const oldFilePath = path.join(
            uploadPath,
            existingRecord[pictureField]
          );
          try {
            await fs.unlink(oldFilePath);
            if (options.verbose) {
              console.log(`Successfully deleted old file: ${oldFilePath}`);
            }
          } catch (err) {
            if (err.code !== "ENOENT") {
              // @Ignore "file not found" errors
              console.error(`Error deleting old file: ${err.message}`);
              throw new Error("Failed to clean up previous file");
            }
          }
        }

        // @Add new file reference to update data
        updateData[pictureField] = newFilename;
      }

      // @Perform the update
      const updatedRecord = await tx[model].update({
        where: {
          [idField]: id,
        },
        data: updateData,
      });

      if (options.verbose) {
        console.log(`Successfully updated ${model} ${idField}=${id}`);
      }

      return updatedRecord;
    } catch (err) {
      console.error(`Error updating ${model} ${idField}=${id}:`, {
        error: err.message,
        model,
        id,
        file: file ? file.originalname : null,
      });

      // @Clean up newly uploaded file if transaction fails
      if (file && uploadPath) {
        try {
          await fs.unlink(file.path);
          if (options.verbose) {
            console.log(`Cleaned up failed upload: ${file.path}`);
          }
        } catch (cleanupErr) {
          console.error("Error cleaning up failed upload:", cleanupErr.message);
        }
      }

      throw err; // @Re-throw to trigger transaction rollback
    }
  });
};

module.exports = {
  baseUpdate,
};
