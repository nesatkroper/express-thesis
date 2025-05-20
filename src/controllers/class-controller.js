const prisma = require("@/lib/prisma");
const model = "class";

const select = async (req, res) => {
  try {
    const skip = req.query.skip ? parseInt(req.query.skip) : 0;
    if (!req.query.take && !req.params.id) return res.status(400).json({ error: "take is required to limit ur data. use it with query params. default skip start from 0." })

    const result = req.params.id ?
      await prisma[model].findUnique({
        where: {
          id: req.params.id,
        },
        include: {
          students: true,
          subjects: true,
        },
      }) :
      await prisma[model].findMany({
        skip,
        take: parseInt(req.query.take),
        include: {
          students: true,
          subjects: true,
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
    if (!req.body.className) return res.status(400).json({ error: "className is required" });
    if (!req.body.gradeLevel) return res.status(400).json({ error: "gradeLevel is required" });
    if (!req.body.academicYear) return res.status(400).json({ error: "academicYear is required" });
    if (!req.body.roomNumber) return res.status(400).json({ error: "roomNumber is required" });

    const result = await prisma[model].create({
      data: req.body,
    })
    return res.status(201).json(result);
  } catch (err) {
    console.log(`Error creating ${model}:`, err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const update = async (req, res) => {
  if (!req.params.id) return res.status(400).json({ error: "id is required" });
  if (!req.body.className) return res.status(400).json({ error: "className is required" });
  if (!req.body.gradeLevel) return res.status(400).json({ error: "gradeLevel is required" });
  if (!req.body.academicYear) return res.status(400).json({ error: "academicYear is required" });
  if (!req.body.roomNumber) return res.status(400).json({ error: "roomNumber is required" });

  try {
    const result = await prisma[model].update({
      where: {
        id: req.params.id,
      },
      data: req.body,
    })

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
  select,
  create,
  update,
};
