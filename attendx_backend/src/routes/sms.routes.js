const express = require("express");
const router = express.Router();
const smsService = require("../services/sms.service");

// Initialize SMS service
smsService.init();

// Send test SMS
router.post("/test", async (req, res) => {
  try {
    const { to, message } = req.body;

    if (!to || !message) {
      return res
        .status(400)
        .json({ error: "Missing required fields: to, message" });
    }

    const result = await smsService.sendSMS(to, message);
    res.json({ success: true, sid: result.sid });
  } catch (error) {
    console.error("Error sending test SMS:", error);
    res.status(500).json({ error: error.message });
  }
});

// Send attendance warning via SMS
router.post("/warning", async (req, res) => {
  try {
    const { phoneNumber, studentName, attendanceRate, courseName } = req.body;

    if (!phoneNumber || !attendanceRate || !courseName) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await smsService.sendAbsenceWarningSMS({
      phoneNumber,
      studentName: studentName || "Student",
      attendanceRate,
      courseName,
    });

    res.json({ success: true, result });
  } catch (error) {
    console.error("Error sending SMS warning:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
