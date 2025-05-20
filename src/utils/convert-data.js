const convertData = (data, modelSchema) => {
  try {
    const convertedData = {};

    for (const key in data) {
      if (!modelSchema[key]) {
        console.warn(
          `Warning: Key "${key}" is not defined in schema for this model.`
        );
        continue;
      }

      if (modelSchema[key] === "Int") {
        convertedData[key] = isNaN(parseInt(data[key]))
          ? null
          : parseInt(data[key]);
      } else if (modelSchema[key] === "Float") {
        convertedData[key] = isNaN(parseFloat(data[key]))
          ? null
          : parseFloat(data[key]);
      } else if (modelSchema[key] === "DateTime") {
        convertedData[key] = data[key] ? new Date(data[key]) : null;
      } else {
        convertedData[key] = data[key];
      }
    }

    return convertedData;
  } catch (err) {
    console.error("Error in convertData:", err.message);
    throw new Error("Failed to convert data due to schema mismatch.");
  }
};

module.exports = {
  convertData,
};
