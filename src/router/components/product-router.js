const express = require("express");
const { upload } = require("@/middleware/storage-middleware");

const router = express.Router();

const {
  select,
  create,
  update,
  patch,
  destroy,
  refresh,
} = require("@/controllers/product-controller");

router.get("/re", refresh);
router.get("/:id?", select);
router.post("/", upload.single("picture"), create);
router.put("/:id", upload.single("picture"), update);
router.patch("/:id", patch);
router.delete("/:id", destroy);

module.exports = router;
