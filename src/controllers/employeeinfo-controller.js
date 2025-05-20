const path = require("path");
const { uploadPath } = require("@/provider/upload-path");

const { baseCreate, baseUpdate, baseDestroy } = require("../utils");

const model = "employeeinfo";

const createInfo = async (req, res) => {
  try {
    const picture = req.file ? path.basename(req.file.path) : null;
    const data = { ...req.body, picture };

    const result = await baseCreate(model, data);
    return res.status(201).json(result);
  } catch (err) {
    console.error(`Error creating ${model}:`, err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const updateInfo = async (req, res) => {
  try {
    const result = await baseUpdate(
      model,
      req.params.id,
      req.body,
      req.file,
      uploadPath
    );

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const destroyInfo = async (req, res) => {
  try {
    const result = await baseDestroy(model, req.params.id);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
  createInfo,
  updateInfo,
  destroyInfo,
};
