const axios = require("axios");
const prisma = require("@/provider/client");
const { DateTime } = require("luxon");

const sendAttendance = async (req, res) => {
  const { employee_id, address } = req.body;

  const token = process.env.BOT2_TOKEN;
  const channel = process.env.CHANNEL_ATTENDANCE;

  if (!employee_id || !address) {
    return res
      .status(400)
      .json({ success: false, error: "All details are required." });
  }

  const emp = await prisma.employee.findUnique({
    where: {
      employee_id: parseInt(employee_id, 10),
    },
  });

  if (!emp) {
    return res
      .status(404)
      .json({ success: false, error: "Employee not found." });
  }

  try {
    const message = `
*New Attendance Received!*
---------------------------------------------------------
  -*Employee ID:* *${employee_id}*
  -*Employee Name:* *${emp.first_name} ${emp.last_name}*
  -*Employee Code:* *${emp.employee_code}*
  -*From Address:* ${address}
---------------------------------------------------------
📅 *Register Date:* ${new Date().toLocaleString()}
`;

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const telegramResponse = await axios.post(url, {
      chat_id: channel,
      text: message,
      parse_mode: "Markdown",
    });

    if (telegramResponse.status === 200) {
      await prisma.attendace.create({
        data: {
          employee_id: emp.employee_id,
          datetime: DateTime.now().setZone("Asia/Phnom_Penh").toISO(),
          note: "N/A",
        },
      });

      return res.status(200).json({
        success: true,
        telegramResponse: telegramResponse.data,
        employee: emp,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, error: telegramResponse.data });
    }
  } catch (error) {
    console.error("Error sending attendance notification:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
};

module.exports = { sendAttendance };
