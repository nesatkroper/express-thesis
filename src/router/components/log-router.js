const express = require("express");
const { exportLogsExcel } = require("@/services/excel/log-excel");

const router = express.Router();

router.get("/exp", exportLogsExcel);

module.exports = router;
