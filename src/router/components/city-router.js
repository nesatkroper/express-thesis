const express = require("express");

const router = express.Router();

const {
  select,
  create,
  update,
  destroy,
} = require("@/controllers/city-controller");
const { exportCity } = require("@/services/excel/city-excel");

router.get("/exp", exportCity);
router.get("/:id?", select);
router.post("/", create);
router.put("/:id", update);
router.delete("/:id", destroy);

module.exports = router;
