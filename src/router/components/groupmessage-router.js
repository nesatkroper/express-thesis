const express = require("express");
const router = express.Router();

const { select, patch } = require("@/controllers/groupmessage-controller");

router.get("/:id?", select);
router.patch("/:id", patch);

module.exports = router;
