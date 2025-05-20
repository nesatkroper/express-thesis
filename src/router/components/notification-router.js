const express = require("express");
const router = express.Router();

const { select } = require("@/controllers/notification-controller");

router.get("/:id?", select);

module.exports = router;
