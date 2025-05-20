const { redisClient } = require("@/middleware/redis-middleware");

module.exports = {
  generateCacheKey: (model, params = {}) => {
    const { id, ...query } = params;
    return `${model}:${id || ""}:${JSON.stringify(query)}`;
  },

  getCached: async (key) => {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis get error:", err);
      return null;
    }
  },

  setCached: async (key, data, ttl = 3600) => {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(data));
    } catch (err) {
      console.error("Redis set error:", err);
    }
  },

  invalidate: async (pattern) => {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length) await redisClient.del(keys);
    } catch (err) {
      console.error("Redis invalidation error:", err);
    }
  },
};
