const jwt = require("jsonwebtoken");
const prisma = require("@/provider/client");

module.exports = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const tokenRecord = await prisma.token.findUnique({
      where: { token },
      include: { auth: { include: { role: true } } },
    });

    if (!tokenRecord) {
      return res
        .status(403)
        .json({ error: "Invalid token - not found in database" });
    }

    if (new Date() > tokenRecord.expiresAt) {
      await prisma.token.delete({ where: { tokenId: tokenRecord.tokenId } });
      return res.status(403).json({ error: "Token expired" });
    }

    req.auth = {
      ...decoded,
      authData: tokenRecord.auth,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token expired" });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(403).json({ error: "Invalid token" });
    }

    console.error("Authentication error:", err);
    return res.status(500).json({ error: "Authentication failed" });
  }
};
