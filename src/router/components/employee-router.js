const express = require("express");
const { upload } = require("@/middleware/storage-middleware");
const authenticateJWT = require("@/middleware/auth-middleware");

const router = express.Router();
const {
  select,
  create,
  update,
  patch,
  destroy,
  refresh,
} = require("@/controllers/employee-controller");

// router.get("/:id?", select);
// router.post("/", create);
// router.put("/:id", update);
// router.patch("/:id", patch);
// router.delete("/:id", destroy);

module.exports = router;
