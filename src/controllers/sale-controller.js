const prisma = require("@/provider/client");
const path = require("path");
const {
  baseSelect,
  baseCreate,
  baseUpdate,
  basePatch,
  baseDestroy,
} = require("../utils");

const model = "sale";

const select = async (req, res) => {
  try {
    const result = await baseSelect(
      model,
      req.params.id,
      req.query,
      `${model}Id`
    );

    if (!result || (Array.isArray(result) && !result.length)) {
      return res.status(404).json({ msg: "No data found" });
    }
    return res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const create = async (req, res) => {
  await prisma.$transaction(async (tx) => {
    try {
      const picture = req.file ? path.basename(req.file.path) : null;
      const { employeeId, customerId, saleDate, amount, memo, cartItems } =
        req.body;

      const sale = await tx.sale.create({
        data: {
          employeeId,
          customerId,
          saleDate,
          amount,
          memo,
          picture,
          status: "active",
        },
      });

      for (const item of cartItems) {
        await tx.saledetail.create({
          data: {
            saleId: sale.saleId,
            productId: item.productId,
            quantity: item.quantity,
            amount: item.amount,
            memo: item.memo,
            status: "active",
          },
        });

        await tx.stock.update({
          where: {
            productId: item.productId,
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
            memo: "Sale",
            status: "active",
          },
        });
      }

      // await tx.payment.create({
      //   data: {
      //     employeeId,
      //     saleId: sale.saleId,
      //     invoice,
      //     hash,
      //     fromAccountId,
      //     toAccountId,
      //     currency,
      //     amount,
      //     externalRef,
      //     status: "active",
      //   },
      // });

      return res.status(201).json(sale);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: `Error :${err}` });
    }
  });
};

const update = async (req, res) => {
  try {
    const result = await baseUpdate(model, req.params.id, req.body);

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const patch = async (req, res) => {
  try {
    const result = await basePatch(model, req.params.id, req.query.type);

    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const destroy = async (req, res) => {
  try {
    const result = await baseDestroy(model, req.params.id);
    return res.status(201).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

module.exports = {
  select,
  create,
  update,
  patch,
  destroy,
};
