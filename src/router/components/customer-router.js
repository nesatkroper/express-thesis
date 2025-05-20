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
  createinfo,
  selectinfo,
  updateinfo,
  clientSelect,
} = require("@/controllers/customer-controller");

router.get("/re", refresh);
router.get("/info/:id", selectinfo);
router.get("/client/:id", clientSelect);
router.get("/:id?", select);
router.post("/info", upload.single("picture"), createinfo);
router.post("/", create);
router.put("/info/:id", upload.single("picture"), updateinfo);
router.put("/:id", update);
router.patch("/:id", patch);
router.delete("/:id", destroy);

module.exports = router;
