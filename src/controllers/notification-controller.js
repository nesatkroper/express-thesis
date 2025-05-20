const prisma = require("@/provider/client");
const { baseSelect } = require("../utils");

const select = async (req, res) => {
  try {
    const result = await baseSelect(
      "notification",
      req.params.id,
      req.query,
      "createdAt"
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

const create = async (message) => {
  try {
    const newChat = await prisma.notification.create({
      data: {
        authId: message.authId,
        content: message.content,
        title: message.title,
      },
    });

    console.table(newChat);
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};

module.exports = { select, create };
