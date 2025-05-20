const validateBody = (schema) => {
  return (req, res, next) => {
    const result = schema(req.body);

    if (!result.ok) return res.status(400).json({ message: result.errors });

    req.body = result.data;
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const result = schema(req.query);

    if (!result.ok) return res.status(400).json({ message: result.errors });

    req.query = result.data;
    next();
  };
};

module.exports = { validateBody, validateQuery };
