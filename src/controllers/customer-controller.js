const path = require("path");
const {
  invalidate,
  generateCacheKey,
  getCached,
  setCached,
} = require("@/utils/base-redis");
const { uploadPath } = require("@/provider/upload-path");

const {
  baseSelect,
  baseCreate,
  baseUpdate,
  basePatch,
  baseDestroy,
} = require("../utils");
const prisma = require("@/provider/client");

const model = "customer";

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

const clientSelect = async (req, res) => {
  try {
    const cacheKey = generateCacheKey(model, { id: req.params.id });
    const cachedData = await getCached(cacheKey);
    if (cachedData) {
      console.log(`✅ Serving ${model} from cache`);
      return res.status(200).json(cachedData);
    }
    const result = await prisma[model].findMany({
      where: {
        employeeId: req.params.id,
      },
      include: {
        info: true,
        address: {
          include: {
            image: true,
          },
        },
      },
    });

    if (!result || (Array.isArray(result) && !result.length))
      return res.status(404).json({ msg: "No data found" });

    await setCached(cacheKey, result);
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const create = async (req, res) => {
  if (!req.body.firstName) {
    return res.status(400).json({ error: "First name is required" });
  }
  try {
    const result = await baseCreate(model, req.body);
    await invalidate(`${model}:*`);
    return res.status(201).json(result);
  } catch (err) {
    console.log(`Error creating ${model}:`, err);
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

const selectinfo = async (req, res) => {
  try {
    const customerExists = await prisma[model].findUnique({
      where: { customerId: req.params.id },
    });

    if (!customerExists) {
      return res.status(404).json({
        msg: "Customer not found",
        id: req.params.id,
      });
    }

    const result = await prisma[`${model}info`].findUnique({
      where: {
        customerId: req.params.id,
      },
    });

    if (!result)
      return res.status(404).json({
        msg: "customerinfo not found (but customer exists)",
        customerExists: true,
      });
    return res.status(200).json({ data: result });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      error: err.message,
      details: {
        model: "Customerinfo",
        searchedId: req.params.id,
        searchedField: "customerId",
      },
    });
  }
};

const createinfo = async (req, res) => {
  try {
    const picture = req.file ? path.basename(req.file.path) : null;
    const data = { ...req.body, picture };

    const result = await baseCreate(`${model}info`, data);
    await invalidate(`${model}info:*`);
    return res.status(201).json(result);
  } catch (err) {
    console.log(`Error creating ${model}:`, err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const updateinfo = async (req, res) => {
  try {
    const result = await baseUpdate(
      model,
      req.params.id,
      req.body,
      req.file,
      uploadPath
    );

    await invalidate(`${model}info:*`);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
  refresh,
  select,
  clientSelect,
  create,
  update,
  patch,
  destroy,
  selectinfo,
  createinfo,
  updateinfo,
};
