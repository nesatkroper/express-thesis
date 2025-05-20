const prisma = require("@/provider/client");
const { baseSelect, basePatch } = require("../utils");
const { invalidate } = require("@/utils/base-redis");

const select = async (req, res) => {
  try {
    const result = await baseSelect(
      "groupmessage",
      req.params.id,
      req.query,
      "createdAt"
    );
    if (!result || (Array.isArray(result) && !result.length))
      return res.status(404).json({ msg: "⛔ No data found" });

    return res.status(200).json(result);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: `❌ Error: ${err.message}` });
  }
};

const create = async (message) => {
  try {
    const newChat = await prisma.groupmessage.create({
      data: {
        authId: message.authId,
        content: message.content,
        time: message.time,
      },
    });

    await invalidate(`groupmessage:*`);

    console.table(newChat);
  } catch (error) {
    console.error("❌ Error saving message:", error);
    throw error;
  }
};

const patch = async (message) => {
  const result = await basePatch(
    "groupmessage",
    message.id,
    message,
    "updatedAt"
  );
};

module.exports = { select, create, patch };
