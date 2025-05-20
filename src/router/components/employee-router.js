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
const {
  createInfo,
  updateInfo,
} = require("@/controllers/employeeinfo-controller");
const { exportEmployeesExcel } = require("@/services/excel/employee-excel");

router.get("/re", refresh);
router.get('/exp', exportEmployeesExcel);
router.get("/:id?", select);
router.post("/", create);
router.put("/:id", update);
router.patch("/:id", patch);
router.delete("/:id", destroy);
router.post("/info", upload.single("picture"), createInfo);
router.put("/info/:id", upload.single("picture"), updateInfo);

module.exports = router;
