module.exports = (err, req, res, next) => {
  console.error(err.stack);

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }

  if (err.name === "UnauthorizedError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.message.includes("ECONNREFUSED")) {
    return res.status(503).json({ error: "Service temporarily unavailable" });
  }

  res.status(500).json({ error: "Something went wrong!" });
};
