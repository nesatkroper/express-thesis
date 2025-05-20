const express = require("express");
const router = express.Router();
const { sendAttendance } = require("@/controllers/telegram-att-controller");

router.post("/", sendAttendance);
module.exports = router;
