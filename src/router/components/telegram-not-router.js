const express = require("express");
const router = express.Router();
const { sendNotification } = require("@/controllers/telegram-not-controller");

router.post("/", sendNotification);
module.exports = router;
