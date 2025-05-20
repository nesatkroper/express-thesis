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
const { Server } = require("socket.io");
const { limiter } = require("@/middleware/limit-middleware");
const { redisClient } = require("@/middleware/redis-middleware");
const { setupSocket } = require("@/middleware/socket-middleware");
const {
  allowedOrigins,
  allowedHeaders,
  methods,
  transports,
} = require("@/constants/cors");

const dbLogger = require("@/middleware/logger-middleware");
const authLogger = require("@/middleware/auth-logger-middleware");
const logger = require("@/middleware/app-logger-middleware");

const app = express();
const server = http.createServer(app);

app.locals.redis = redisClient;

app.use(limiter);
app.use(bodyParser.json());
app.use(helmet());
app.use(errorHandler);
app.use(dbLogger);
app.use(authLogger);

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

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    methods,
    allowedHeaders,
    credentials: true,
  })
);

app.use(
  "/uploads",
  protectedStatic(path.join(__dirname, "public/uploads"), {
    requireAuth: false,
    defaultImage: "default.png",
  })
);

app.use("/v1", router);

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by Socket"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports,
});

app.use((req, res, next) => {
  console.log(`Request from: ${req.headers.origin}`);
  next();
});

setupSocket(io, prisma);

const startServer = async () => {
  try {
    const PORT = process.env.PORT || 5000;

    await Promise.all([prisma.$connect(), redisClient.ping()]);
    console.log("✅ All services connected successfully");

    server.listen(PORT, () => {
      console.log(`✅ Server running on port http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error :", error);
  }
};

startServer();
