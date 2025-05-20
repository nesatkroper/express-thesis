require("dotenv").config();
require("module-alias/register");

const express = require("express");
const cors = require("cors");
const router = require("@router/router.js");
const path = require("path");
const http = require("http");
const helmet = require("helmet");
const prisma = require("@/provider/client");
const bodyParser = require("body-parser");
const protectedStatic = require("./src/middleware/static-middleware");
const errorHandler = require("@/middleware/error-handler-middleware");
const { limiter } = require("@/middleware/limit-middleware");
const dbLogger = require("@/middleware/logger-middleware");
const logger = require("@/middleware/app-logger-middleware");
const app = express();
const server = http.createServer(app);

app.use(limiter);
app.use(bodyParser.json());
app.use(helmet());
app.use(errorHandler);
app.use(dbLogger);

app.use((req, res, next) => {
  logger.info({
    method: req.method,
    url: req.url,
    ip: req.ip,
  });
  next();
});

app.use((err, req, res, next) => {
  logger.error({
    error: err.message,
    stack: err.stack,
  });
  next(err);
});

app.use(cors());

app.use(
  "/uploads",
  protectedStatic(path.join(__dirname, "public/uploads"), {
    requireAuth: false,
    defaultImage: "default.png",
  })
);

app.use("/v1", router);

app.use((req, res, next) => {
  console.log(`Request from: ${req.headers.origin}`);
  next();
});

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;

    await prisma.$connect();  // Just await the single connection
    console.log("✅ Database connected successfully");

    server.listen(PORT, () => {
      console.log(`✅ Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error);
    process.exit(1); 
  }
};

startServer();
