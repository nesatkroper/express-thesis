const { create: msgCreate } = require("@/controllers/groupmessage-controller");
const { create: ntfCreate } = require("@/controllers/notification-controller");
const { createAdapter } = require("@socket.io/redis-adapter");
const { redisClient } = require("@/middleware/redis-middleware");

const setupSocket = (io, db) => {
  io.adapter(createAdapter(redisClient, redisClient.duplicate()));

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    socket.on("sendMessage", async (message) => {
      console.table("✅ Received message:", message);
      io.emit("receiveMessage", message);
    });

    socket.on("sendGroup", async (message) => {
      io.emit("receiveGroup", message);

      try {
        await msgCreate(message);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("sendNotification", async (message) => {
      console.table(message.data);
      io.emit("receiveNotification", message);

      try {
        await ntfCreate(message);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = { setupSocket };
