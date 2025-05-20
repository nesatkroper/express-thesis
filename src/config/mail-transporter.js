const nodemailer = require("nodemailer");

const mailhogTransporter = nodemailer.createTransport({
  host: "localhost",
  port: 1025,
  secure: false,
  tls: {
    rejectUnauthorized: false,
  },
  headers: {
    "X-Mailer": "MyApp",
    "X-Priority": "1",
  },
});

const brevoTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  headers: {
    "X-Mailer": "MyApp",
    "X-Priority": "1",
  },
});

module.exports = { mailhogTransporter, brevoTransporter };
