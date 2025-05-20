const prisma = require("@/lib/prisma");
const fs = require("fs").promises;
const path = require("path");
const { modelSchemas } = require("./base-schema");
const { convertData } = require("./convert-data");

const baseUpdate = async (model, id, data, file, uploadPath, options = {}) => {
  if (!prisma[model]) {
    throw new Error(`Prisma model "${model}" not found`);
  }
  if (!modelSchemas[model]) {
    throw new Error(`Model schema for "${model}" not found`);
  }


  const idField = options.idField || `${model}Id`;
  const pictureField = options.pictureField || "picture";

  return await prisma.$transaction(async (tx) => {
    try {

      const updateData = convertData(data, modelSchemas[model]);
      if (!updateData || typeof updateData !== "object") {
        throw new Error("Data conversion failed - invalid result");
      }


      const existingRecord = await tx[model].findUnique({
        where: {
          [idField]: id,
        },
      });

      if (!existingRecord) {
        throw new Error(`${model} with ${idField}=${id} not found`);
      }


      if (file && uploadPath) {
        const newFilename = path.basename(file.path);


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

              console.error(`Error deleting old file: ${err.message}`);
              throw new Error("Failed to clean up previous file");
            }
          }
        }


        updateData[pictureField] = newFilename;
      }


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

      throw err;
    }
  });
};

module.exports = {
  baseUpdate,
};
