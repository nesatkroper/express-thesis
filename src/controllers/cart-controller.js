const prisma = require("@/provider/client");
const { baseCreate } = require("@/utils");
const { invalidate } = require("@/utils/base-redis");
const model = "cart";

const refresh = async (req, res) => {
  await invalidate(`${model}:*`);
  return res.status(203).json({ msg: "Cache invalidated" });
};

const select = async (req, res) => {
  if (!req.params.id)
    return res.status(404).json({ error: "Auth ID: Invalid." });
  try {
    const result = await prisma.cart.findMany({
      where: {
        authId: req.params.id,
      },
      include: {
        product: true,
      },
    });

    if (!result || (Array.isArray(result) && !result.length))
      return res.status(400).json({ msg: "no data" });
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const create = async (req, res) => {
  try {
    const { authId, productId } = req.body;

    const result = await prisma.cart.upsert({
      where: {
        authId_productId: {
          authId,
          productId,
        },
      },
      update: {
        quantity: { increment: 1 },
        updatedAt: new Date(),
      },
      create: {
        ...req.body,
        quantity: 1,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await invalidate(`${model}:*`);
    return res.status(201).json(result);
  } catch (err) {
    console.error("Error in cart create:", err);
    return res.status(500).json({ error: `Error: ${err.message}` });
  }
};

const qtyIncrease = async (req, res) => {
  try {
    const { cartId } = req.params;

    const findCart = await prisma.cart.findUnique({
      where: {
        cartId: parseInt(cartId, 10),
      },
    });

    const update = await prisma.cart.update({
      where: {
        cartId: parseInt(cartId, 10),
      },
      data: {
        quantity: (findCart.quantity, 10) + 1,
      },
    });

    await invalidate(`${model}:*`);
    return res.status(201).json(update);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};
const qtyDecrease = async (req, res) => {
  try {
    const { cartId } = req.params;

    const findCart = await prisma.cart.findUnique({
      where: {
        cartId: parseInt(cartId, 10),
      },
    });

    if (findCart.quantity === 1) {
      const destroy = await prisma.cart.delete({
        where: { cartId: parseInt(cartId) },
      });

      await invalidate(`${model}:*`);
      return res.status(201).json(destroy);
    } else {
      const update = await prisma.cart.update({
        where: {
          cartId: parseInt(cartId, 10),
        },
        data: {
          quantity: (findCart.quantity, 10) - 1,
        },
      });

      await invalidate(`${model}:*`);
      return res.status(201).json(update);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: `Error :${err}` });
  }
};

const destroy = async (req, res) => {
  try {
    const { cartId } = req.params;

    const destroy = await prisma.cart.delete({
      where: { cartId: parseInt(cartId) },
    });

    await invalidate(`${model}:*`);
    return res.status(201).json(destroy);
  } catch (err) {
    return res.status(500).json({ error: `Error :${err}` });
  }
};

module.exports = { select, create, qtyIncrease, qtyDecrease, destroy, refresh };

// const qtyIncrease = async (req, res) => {
//   try {
//     const { cartId } = req.params;

//     // Validate cartId is a valid number
//     const numericCartId = parseInt(cartId, 10);
//     if (isNaN(numericCartId)) {
//       return res.status(400).json({ error: "Invalid cart ID" });
//     }

//     // Using direct update with increment for atomic operation
//     const updatedCart = await prisma.cart.update({
//       where: { cartId: numericCartId },
//       data: {
//         quantity: { increment: 1 },
//         updatedAt: new Date()
//       },
//     });

//     await invalidate(`${model}:*`);
//     return res.status(200).json(updatedCart);
//   } catch (err) {
//     console.error('Error increasing quantity:', err);

//     if (err.code === 'P2025') {
//       return res.status(404).json({ error: "Cart item not found" });
//     }
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// const qtyDecrease = async (req, res) => {
//   try {
//     const { cartId } = req.params;

//     // Validate cartId is a valid number
//     const numericCartId = parseInt(cartId, 10);
//     if (isNaN(numericCartId)) {
//       return res.status(400).json({ error: "Invalid cart ID" });
//     }

//     // Find cart item first to check quantity
//     const cartItem = await prisma.cart.findUnique({
//       where: { cartId: numericCartId },
//     });

//     if (!cartItem) {
//       return res.status(404).json({ error: "Cart item not found" });
//     }

//     if (cartItem.quantity <= 1) {
//       // Remove item if quantity would go to 0
//       await prisma.cart.delete({ where: { cartId: numericCartId } });
//       await invalidate(`${model}:*`);
//       return res.status(200).json({
//         message: "Cart item removed",
//         removed: true
//       });
//     } else {
//       // Decrease quantity
//       const updatedCart = await prisma.cart.update({
//         where: { cartId: numericCartId },
//         data: {
//           quantity: { decrement: 1 },
//           updatedAt: new Date()
//         },
//       });
//       await invalidate(`${model}:*`);
//       return res.status(200).json(updatedCart);
//     }
//   } catch (err) {
//     console.error('Error decreasing quantity:', err);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };
