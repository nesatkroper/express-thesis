const path = require("path");
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
    return res.status(201).json(result);
  } catch (err) {
    console.log(`Error creating ${model}:`, err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const update = async (req, res) => {
  try {
    const result = await baseUpdate(model, req.params.id, req.body);

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const patch = async (req, res) => {
  try {
    const result = await basePatch(model, req.params.id, req.query.type);

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const destroy = async (req, res) => {
  try {
    const result = await baseDestroy(model, req.params.id);

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

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
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
