const prisma = require("@/provider/client");
const morgan = require("morgan");

const logToDB = async (
  authId,
  method,
  url,
  status,
  responseTime,
  ip,
  userAgent
) => {
  try {
    await prisma.authLog.create({
      data: {
        authId,
        method,
        url,
        status,
        responseTime,
        ip,
        userAgent,
      },
    });
  } catch (error) {
    console.error("Error saving log:", error);
  }
};

morgan.token(
  "response-time-ms",
  (req, res) => res.get("X-Response-Time") || "0"
);

module.exports = morgan((tokens, req, res) => {
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const status = parseInt(tokens.status(req, res), 10);
  const responseTime = parseFloat(tokens["response-time-ms"](req, res));
  const ip = req.ip;
  const userAgent = req.headers["user-agent"] || "";

  let authId = null;

  if (url === "/v1/login" && method === "POST") {
    const { email } = req.body;
    if (email) {
      prisma.auth
        .findUnique({
          where: { email },
          select: { authId: true },
        })
        .then((authUser) => {
          if (authUser) {
            logToDB(
              authUser.authId,
              method,
              url,
              status,
              responseTime,
              ip,
              userAgent
            );
          }
        })
        .catch((error) => console.error("Error fetching authId:", error));
    }
  } else if (url === "/v1/logout" && method === "POST") {
    if (req.user && req.user.authId) {
      authId = req.user.authId;
      logToDB(authId, method, url, status, responseTime, ip, userAgent);
    } else {
      console.error("Logout request made but req.user is missing!");
    }
  }

  return null;
});
