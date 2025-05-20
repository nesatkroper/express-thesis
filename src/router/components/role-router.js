const express = require("express");
const router = express.Router();

const {
  select,
  create,
  update,
  patch,
  destroy,
  refresh,
} = require("@/controllers/role-controller");

router.get("/re", refresh);
router.get("/:id?", select);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id", patch);
router.delete("/:id", destroy);

module.exports = router;
