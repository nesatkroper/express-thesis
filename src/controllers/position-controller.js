const { invalidate } = require("@/utils/base-redis");
const {
  baseSelect,
  baseCreate,
  baseUpdate,
  basePatch,
  baseDestroy,
} = require("../utils");

const model = "position";
const field = "positionCode";
const prefix = "POS";

const refresh = async (req, res) => {
  await invalidate(`${model}:*`);
  return res.status(203).json({ msg: "Cache invalidated" });
};

const select = async (req, res) => {
  try {
    const result = await baseSelect(
      model,
      req.params.id,
      req.query,
      "createdAt"
    );

    if (!result || (Array.isArray(result) && !result.length))
      return res.status(404).json({ msg: "No data found" });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const create = async (req, res) => {
  try {
    const data = { ...req.body };

    const result = await baseCreate(model, data, {
      field,
      prefix,
      idField: `${model}Id`,
    });

    await invalidate(`${model}:*`);
    return res.status(201).json(result);
  } catch (err) {
    console.error(`Error creating ${model}:`, err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const update = async (req, res) => {
  try {
    const result = await baseUpdate(model, req.params.id, req.body);

    await invalidate(`${model}:*`);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const patch = async (req, res) => {
  try {
    const result = await basePatch(model, req.params.id, req.query.type);

    await invalidate(`${model}:*`);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const destroy = async (req, res) => {
  try {
    const result = await baseDestroy(model, req.params.id);

    await invalidate(`${model}:*`);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
  select,
  create,
  update,
  patch,
  destroy,
  refresh,
};
