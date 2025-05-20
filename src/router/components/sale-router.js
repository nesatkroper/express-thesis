const express = require("express");

const router = express.Router();

const {
  select,
  create,
  update,
  patch,
  destroy,
} = require("@/controllers/sale-controller");

router.get("/:id?", select);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id", patch);
router.delete("/:id", destroy);

module.exports = router;
