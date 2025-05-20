const { createClient } = require("redis");

const redisClient = createClient({
  url: process.env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 5) {
        console.log("Too many Redis connection attempts");
        return false;
      }
      return Math.min(retries * 200, 2000);
    },
  },
});

redisClient.on("error", (err) => {
  if (err.message.includes("WRONGPASS")) {
    console.error("❌ Redis authentication failed - check your password");
  } else {
    console.error("Redis error:", err.message);
  }
});

(async () => {
  try {
    await redisClient.connect();
    console.log("✅ Redis connected");
  } catch (err) {
    console.error("❌ Redis connection failed:", err.message);
  }
})();

module.exports = { redisClient };
