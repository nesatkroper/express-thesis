const crypto = require("crypto");
const { mailhogTransporter } = require("@/config/mail-transporter");
const { mailTemplateRedesign } = require("@/constants/mail-template");

const otps = {};
const transporter = mailhogTransporter;

exports.send = async (req, res) => {
  const { email } = req.body;
  const otp = crypto.randomInt(10000, 99999);

  otps[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

  const mailOptions = {
    from: process.env.SMTP_SENDER,
    to: email,
    subject: "Your OTP Code",
    html: mailTemplateRedesign(email, otp),
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("OTP sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to send OTP.");
  }
};

exports.verify = (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otps[email];

    if (!record) {
      return res.status(400).send("Invalid or expired OTP.");
    }

    if (record.otp === parseInt(otp) && record.expiresAt > Date.now()) {
      delete otps[email];
      return res.status(200).send("OTP verified!");
    }

    res.status(400).send("Invalid or expired OTP.");
  } catch (error) {
    console.error(error);
  }
};
