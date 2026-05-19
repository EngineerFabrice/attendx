const express = require("express");
const router = express.Router();
const fcmService = require("../services/fcm.service");

// Initialize FCM on server start
fcmService.init();

// Middleware to log all requests to this route
router.use((req, res, next) => {
  console.log(`[WARNING ROUTE] ${req.method} ${req.path}`);
  console.log("[WARNING ROUTE] Headers:", req.headers);
  console.log("[WARNING ROUTE] Body:", req.body);
  next();
});

// Send warning to a single student
router.post("/send-warning", async (req, res) => {
  try {
    console.log("[WARNING] Received request body:", req.body);
    console.log("[WARNING] Content-Type:", req.headers["content-type"]);

    const { studentId, studentName, attendanceRate, courseName } = req.body;

    console.log("[WARNING] Extracted values:", {
      studentId,
      studentName,
      attendanceRate,
      courseName,
    });

    // Validate required fields with detailed errors
    const missingFields = [];
    if (!studentId) missingFields.push("studentId");
    if (attendanceRate === undefined || attendanceRate === null)
      missingFields.push("attendanceRate");
    if (!courseName) missingFields.push("courseName");

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
        receivedBody: req.body,
        contentType: req.headers["content-type"],
      });
    }

    await fcmService.notifyAbsenceWarning({
      studentId,
      studentName: studentName || "Student",
      attendanceRate,
      courseName,
    });

    res.json({
      success: true,
      message: `Warning sent to ${studentName || studentId}`,
    });
  } catch (error) {
    console.error("Error sending warning:", error);
    res.status(500).json({
      error: "Failed to send warning",
      details: error.message,
    });
  }
});

// Send warnings to multiple students
router.post("/send-bulk-warnings", async (req, res) => {
  try {
    const { students } = req.body;

    if (!students || !students.length) {
      return res.status(400).json({ error: "No students provided" });
    }

    const results = await fcmService.notifyBulkAbsenceWarnings(students);

    res.json({
      success: true,
      ...results,
      total: students.length,
    });
  } catch (error) {
    console.error("Error sending bulk warnings:", error);
    res.status(500).json({
      error: "Failed to send bulk warnings",
      details: error.message,
    });
  }
});

// Get warning history for a student
router.get("/warnings/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;
    const db = require("../config/database");

    const [rows] = await db.query(
      `SELECT * FROM attendance_warnings 
       WHERE student_id = ? 
       ORDER BY sent_at DESC`,
      [studentId],
    );

    res.json({ success: true, warnings: rows });
  } catch (error) {
    console.error("Error fetching warnings:", error);
    res.status(500).json({ error: "Failed to fetch warnings" });
  }
});

module.exports = router;
