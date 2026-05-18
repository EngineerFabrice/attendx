const path = require("path");
const fs = require("fs");
const db = require("../config/database");

let messaging = null; // firebase-admin messaging instance

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

// Rest of your existing functions remain the same...
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
        console.warn(`[FCM] ${failed}/${chunk.length} messages failed`);
    } catch (e) {
      console.warn("[FCM] sendEachForMulticast error:", e.message);
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
    const [rows] = await db.query(
      "SELECT student_id FROM enrollments WHERE course_id = ?",
      [courseId],
    );
    const tokens = await getTokens(rows.map((r) => r.student_id));
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
    await sendMulticast(tokens, {
      title: "Absence Recorded",
      body: `You were marked absent for ${courseName}`,
      data: { type: "absence_warning", sessionId, courseId, courseName },
    });
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

module.exports = {
  init,
  notifySessionStarted,
  notifyAbsentStudents,
  notifyAttendanceConfirmed,
};
