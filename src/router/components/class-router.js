const express = require("express");
const router = express.Router();

const {
  select,
  create,
  update,
  destroy,
} = require("@/controllers/class-controller");

router.get("/:id?", select);
router.post("/", create);
router.put("/:id", update);

module.exports = router;
