const prisma = require("@/lib/prisma");
const {
  baseCreate,
  baseUpdate,
  basePatch,
  baseDestroy,
} = require("../utils");

const model = "student";

const select = async (req, res) => {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    if (!req.query.take && !req.params.id) return res.status(400).json({ error: "take is required to limit ur data. use it with query params. default skip start from 0." })

    const result = req.params.id ? await prisma[model].findUnique({
      where: {
        id: req.params.id,
      },
      include: {
        parents: true,
        class: true,
        grades: true,
      },
    }) :
      await prisma[model].findMany({
        skip,
        take: parseInt(req.query.take),
        include: {
          parents: true,
          class: true,
          grades: true,
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
  try {
    if (!req.body.studentCode) return res.status(400).json({ error: "studentCode is required" });
    if (!req.body.firstName) return res.status(400).json({ error: "firstName is required" });
    if (!req.body.lastName) return res.status(400).json({ error: "lastName is required" });
    if (!req.body.email) return res.status(400).json({ error: "email is required" });
    if (!req.body.phone) return res.status(400).json({ error: "phone is required" });
    if (!req.body.status) return res.status(400).json({ error: "status is required" });
    if (!req.body.joinDate) return res.status(400).json({ error: "joinDate is required" });

    const result = await prisma[model].create({
      data: req.body,
    })

    return res.status(201).json(result);
  } catch (err) {
    console.error(`Error creating ${model}:`, err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const update = async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).json({ error: "id is required" });
    if (!req.body.studentCode) return res.status(400).json({ error: "studentCode is required" });
    if (!req.body.firstName) return res.status(400).json({ error: "firstName is required" });
    if (!req.body.lastName) return res.status(400).json({ error: "lastName is required" });
    if (!req.body.email) return res.status(400).json({ error: "email is required" });
    if (!req.body.phone) return res.status(400).json({ error: "phone is required" });
    if (!req.body.status) return res.status(400).json({ error: "status is required" });
    if (!req.body.joinDate) return res.status(400).json({ error: "joinDate is required" });

    const result = await prisma[model].update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    });

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const patch = async (req, res) => {
  try {
    const result = await basePatch(model, req.params.id, req.query.type);

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const destroy = async (req, res) => {
  try {
    const result = await baseDestroy(model, req.params.id);

    return res.status(201).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
  select,
  create,
  update,
  patch,
  destroy,
};
