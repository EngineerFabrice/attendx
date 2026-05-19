const path = require("path");
const fs = require("fs");
const db = require("../config/database");
const smsService = require("./sms.service"); // For fallback SMS notifications if FCM fails
const { v4: uuidv4 } = require("uuid");

let messaging = null; // firebase-admin messaging instance

// Initialize SMS service
smsService.init();

function init() {
  if (messaging) return messaging;

  const keyPath = process.env.FCM_SERVICE_ACCOUNT_KEY;
  if (!keyPath) {
    console.warn(
      "[FCM] FCM_SERVICE_ACCOUNT_KEY not set in .env - push notifications disabled",
    );
    return null;
  }

  const resolved = path.resolve(keyPath);
  console.log("[FCM] Looking for service account at:", resolved);

  if (!fs.existsSync(resolved)) {
    console.warn("[FCM] Service account key not found at", resolved);
    console.warn("[FCM] Push notifications disabled. To enable:");
    console.warn("[FCM]   1. Download service account from Firebase Console");
    console.warn("[FCM]   2. Save as serviceAccountKey.json in project root");
    console.warn(
      "[FCM]   3. Set FCM_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json in .env",
    );
    return null;
  }

  try {
    const admin = require("firebase-admin");
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, "utf8"));

    // Validate required fields
    if (
      !serviceAccount.project_id ||
      !serviceAccount.private_key ||
      !serviceAccount.client_email
    ) {
      console.warn(
        "[FCM] Service account missing required fields (project_id, private_key, client_email)",
      );
      return null;
    }

    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }

    messaging = admin.messaging();
    console.log(
      "[FCM] ✅ Initialized successfully — project:",
      serviceAccount.project_id,
    );
    return messaging;
  } catch (e) {
    console.warn("[FCM] Init failed:", e.message);
    return null;
  }
}

async function getTokens(userIds) {
  if (!userIds.length) return [];
  const placeholders = userIds.map(() => "?").join(",");
  const [rows] = await db.query(
    `SELECT token FROM device_tokens WHERE user_id IN (${placeholders})`,
    userIds,
  );
  return rows.map((r) => r.token).filter(Boolean);
}

async function sendMulticast(tokens, { title, body, data = {} }) {
  if (!tokens.length) return;
  const m = init();
  if (!m) return; // FCM not configured — skip silently

  // FCM sendEachForMulticast accepts max 500 tokens per call
  const chunks = [];
  for (let i = 0; i < tokens.length; i += 500)
    chunks.push(tokens.slice(i, i + 500));

  const stringData = {};
  for (const [k, v] of Object.entries(data)) stringData[k] = String(v);

  for (const chunk of chunks) {
    try {
      const result = await m.sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data: stringData,
        android: {
          priority: "high",
          notification: { channelId: "attendx_main", sound: "default" },
        },
        apns: {
          payload: { aps: { sound: "default", badge: 1 } },
        },
      });
      const failed = result.responses.filter((r) => !r.success).length;
      if (failed)
        console.warn(`[FCM/SMS] ${failed}/${chunk.length} messages failed`);
    } catch (e) {
      console.warn("[FCM/SMS] sendEachForMulticast error:", e.message);
    }
  }
}

async function notifySessionStarted({
  sessionId,
  courseId,
  courseName,
  room,
  sessionCode,
}) {
  try {
    // Get enrolled students with their phone numbers
    const [rows] = await db.query(
      `SELECT e.student_id, u.phone, u.full_name 
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       WHERE e.course_id = ? AND u.phone IS NOT NULL`,
      [courseId],
    );

    const tokens = await getTokens(rows.map((r) => r.student_id));
    if (tokens.length > 0) {
      await sendMulticast(tokens, {
        title: "Session Started",
        body: `${courseName} in ${room} — tap to check in`,
        data: {
          type: "session_started",
          sessionId,
          courseId,
          courseName,
          room,
          sessionCode,
        },
      });
    }

    // Send SMS to students without tokens but with phone numbers
    const studentsWithoutTokens = rows.filter(
      (r) => !tokens.includes(r.student_id),
    );
    for (const student of studentsWithoutTokens) {
      if (student.phone) {
        try {
          await smsService.sendSessionReminderSMS({
            phoneNumber: student.phone,
            studentName: student.full_name,
            courseName,
            room,
            sessionCode,
          });
          // Rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (smsError) {
          console.error(
            `[SMS] Failed to send session reminder to ${student.full_name}:`,
            smsError.message,
          );
        }
      }
    }
  } catch (e) {
    console.warn("[FCM] notifySessionStarted:", e.message);
  }
}

async function notifyAbsentStudents({ sessionId, courseId }) {
  try {
    const [rows] = await db.query(
      `SELECT ar.student_id, c.name AS courseName
         FROM attendance_records ar
         JOIN attendance_sessions s ON s.id = ar.session_id
         JOIN courses c ON c.id = s.course_id
        WHERE ar.session_id = ? AND ar.status = 'absent'`,
      [sessionId],
    );
    if (!rows.length) return;
    const courseName = rows[0].courseName;
    const tokens = await getTokens(rows.map((r) => r.student_id));
    if (tokens.length > 0) {
      await sendMulticast(tokens, {
        title: "Absence Recorded",
        body: `You were marked absent for ${courseName}`,
        data: { type: "absence_warning", sessionId, courseId, courseName },
      });
    }
  } catch (e) {
    console.warn("[FCM] notifyAbsentStudents:", e.message);
  }
}

async function notifyAttendanceConfirmed(studentId, courseName) {
  try {
    const tokens = await getTokens([studentId]);
    await sendMulticast(tokens, {
      title: "Attendance Confirmed",
      body: `You have been marked present for ${courseName}`,
      data: { type: "attendance_confirmed", courseName },
    });
  } catch (e) {
    console.warn("[FCM] notifyAttendanceConfirmed:", e.message);
  }
}

async function notifyAbsenceWarning({
  studentId,
  studentName,
  attendanceRate,
  courseName,
}) {
  try {
    console.log(`[FCM/SMS] Sending warning to ${studentName} (${studentId})`);
    console.log(
      `[FCM/SMS] Attendance: ${attendanceRate}%, Course: ${courseName}`,
    );

    // Get student phone number for SMS fallback
    const [studentRows] = await db.query(
      "SELECT phone, email FROM users WHERE id = ?",
      [studentId],
    );
    const studentPhone = studentRows[0]?.phone;

    const tokens = await getTokens([studentId]);
    let fcmSent = false;

    if (tokens.length > 0) {
      await sendMulticast(tokens, {
        title: "⚠️ Attendance Warning",
        body: `${studentName}, your attendance in ${courseName} is ${attendanceRate}%. Please attend more classes to avoid penalties.`,
        data: {
          type: "absence_warning",
          studentId: String(studentId),
          attendanceRate: String(attendanceRate),
          courseName: courseName,
          action: "view_attendance",
        },
      });
      console.log(
        `[FCM/SMS] Absence warning sent to ${studentName} (${attendanceRate}%)`,
      );
      fcmSent = true;
    } else {
      console.warn(`[FCM/SMS] No FCM token found for student ${studentId}`);
    }

    // Send SMS as fallback if student has phone number
    let smsSent = false;
    if (studentPhone) {
      try {
        await smsService.sendAbsenceWarningSMS({
          phoneNumber: studentPhone,
          studentName,
          attendanceRate,
          courseName,
        });
        smsSent = true;
        console.log(`[SMS] SMS sent to ${studentName} at ${studentPhone}`);
      } catch (smsError) {
        console.error(
          `[SMS] Failed to send SMS to ${studentName}:`,
          smsError.message,
        );
      }
    } else {
      console.log(`[SMS] No phone number for ${studentName}`);
    }

    // Log the warning in database - FIXED: Correct number of parameters
    const warningId = uuidv4();
    await db.query(
      `INSERT INTO attendance_warnings (id, student_id, course_name, attendance_rate, sent_at, status) 
       VALUES (?, ?, ?, ?, NOW(), 'sent')`,
      [warningId, studentId, courseName, attendanceRate],
    );
    console.log(`[FCM/SMS] Warning logged to database with ID: ${warningId}`);
    console.log(`[FCM/SMS] Delivery: FCM=${fcmSent}, SMS=${smsSent}`);
  } catch (e) {
    console.error("[FCM/SMS] notifyAbsenceWarning error:", e.message);
    throw e;
  }
}

async function notifyBulkAbsenceWarnings(students) {
  const results = { success: 0, failed: 0 };

  for (const student of students) {
    try {
      await notifyAbsenceWarning({
        studentId: student.id,
        studentName: student.fullName,
        attendanceRate: student.attendanceRate,
        courseName: student.course,
      });
      results.success++;

      // Add delay to avoid overwhelming the system
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (e) {
      console.warn(
        `[FCM/SMS] Failed to send to ${student.fullName}:`,
        e.message,
      );
      results.failed++;
    }
  }

  return results;
}

module.exports = {
  init,
  notifySessionStarted,
  notifyAbsentStudents,
  notifyAttendanceConfirmed,
  notifyAbsenceWarning,
  notifyBulkAbsenceWarnings,
};
