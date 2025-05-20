const axios = require("axios");

const sendNotification = async (req, res) => {
  const {
    order_id,
    customer_name,
    products,
    total_amout,
    address,
    payment_status,
  } = req.body;
  const token = process.env.BOT2_TOKEN;
  const channel = process.env.CHANNEL_NOTIFICATION;

  if (
    !order_id ||
    !customer_name ||
    !products ||
    !total_amout ||
    !address ||
    !payment_status
  ) {
    return res
      .status(400)
      .json({ success: false, error: "All order details are required." });
  }

  const productDetails = products
    .map(
      (product, index) => `${index + 1}. ${product.name} (x${product.quantity})`
    )
    .join("\n");

  const message = `
*New Order Received!*
---------------------------------------------------------
    -*Order ID:* ${order_id}
    -*Customer:* ${customer_name}
    -*Delivery Address:* ${address}
    -*Payment Status:* ${payment_status}
    -*Total Amount:* $${total_amout.toFixed(2)}

🛍 *Products:*
---------------------------------------------------------
${productDetails}

📅 *Order Date:* ${new Date().toLocaleString()}
`;

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const response = await axios.post(url, {
      chat_id: channel,
      text: message,
      parse_mode: "Markdown",
    });

    res.status(200).json({ success: true, telegramResponse: response.data });
  } catch (error) {
    console.error(
      "Error sending order notification:",
      error.response?.data || error.message
    );
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { sendNotification };
