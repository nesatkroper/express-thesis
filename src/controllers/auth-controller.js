const { data } = require("@/middleware/app-logger-middleware");
const prismaClient = require("@/provider/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const cleanExpiredTokens = async () => {
  await prismaClient.token.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

const generateToken = async (auth, req) => {
  if (!auth.role || !auth.role.name)
    throw new Error("Role information is missing");

  const token = jwt.sign(
    { authId: auth.authId, role: auth.role.name },
    process.env.JWT_SECRET,
    { expiresIn: "12h" }
  );

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 12);

  await prismaClient.token.create({
    data: {
      token,
      expiresAt,
      deviceInfo: req.headers["user-agent"],
      ipAddress: req.ip,
      authId: auth.authId,
    },
  });

  await cleanExpiredTokens();
  return token;
};

const register = async (req, res) => {
  const { email, password, role, employeeId, customerId } = req.body;
  try {
    if (typeof role !== "string")
      return res.status(400).json({ err: "Role must be a String." });

    const existingAuth = await prismaClient.auth.findUnique({
      where: { email },
    });
    if (existingAuth) {
      return res.status(400).json({ error: "auth already exists" });
    }

    const hashedPass = await bcrypt.hash(password, 10);

    const authRole = await prismaClient.role.findUnique({
      where: { name: String(role) },
    });

    if (!authRole)
      return res.status(400).json({ error: "Role does not exist" });

    const newAuth = await prismaClient.auth.create({
      data: {
        email,
        password: hashedPass,
        roleId: authRole.roleId,
        employeeId: parseInt(employeeId, 10),
      },
      include: {
        role: true,
        employee: true,
      },
    });

    const token = await generateToken(newAuth, req);

    res.status(201).json({
      token,
      auth: {
        authId: newAuth.authId,
        email: newAuth.email,
        role: newAuth.role.name,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error registering user" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const auth = await prismaClient.auth.findUnique({
      where: { email },
      include: {
        role: true,
        employee: true,
      },
    });

    if (!auth) return res.status(404).json({ error: "auth not found" });

    if (auth.status != "active")
      return res.status(400).json({
        error: "account has been blocked!",
        msg: "please contact to admin to reactive.",
      });

    const isMatch = await bcrypt.compare(password, auth.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = await generateToken(auth, req);
    res.status(200).json({
      token,
      auth,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Login failed" });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      await prismaClient.token.deleteMany({
        where: { token },
      });
    }

    res.clearCookie("token");

    return res.status(204).json({ message: "Logged out successfully." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Logout failed." });
  }
};

const editRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    const result = await prismaClient.auth.update({
      where: { authId: id },
      data: {
        role: roleId,
      },
    });
  } catch (error) {}
};

const getAllAuth = async (req, res) => {
  try {
    const auths = await prismaClient.auth.findMany({
      include: { role: true, employee: true },
    });
    return res.status(200).json(auths);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch auths" });
  }
};

const getAuth = async (req, res) => {
  try {
    const auth = await prismaClient.auth.findUnique({
      where: { authId: req.auth.authId },
      include: {
        role: true,
        employee: true,
      },
    });

    if (!auth) return res.status(404).json({ error: "auth not found" });

    return res.status(200).json(auth);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch auth" });
  }
};

module.exports = { register, login, getAllAuth, getAuth, logout };
