const express = require("express");
const router = express.Router();

const {
  select,
  create,
  qtyIncrease,
  qtyDecrease,
  destroy,
  refresh,
} = require("@/controllers/cart-controller");

const { exportExcel } = require("@/controllers/cart-excel");

router.get("/re", refresh);
router.get("/export", exportExcel);
router.get("/:id", select);
router.post("/", create);
router.put("/inc/:cartId", qtyIncrease);
router.put("/dec/:cartId", qtyDecrease);
router.delete("/:id", destroy);
module.exports = router;
