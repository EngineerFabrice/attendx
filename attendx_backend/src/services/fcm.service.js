/**
 * FCM service — sends push notifications via Firebase Admin SDK.
 *
 * Gracefully does nothing if FCM_SERVICE_ACCOUNT_KEY is not set or the file
 * does not exist. This lets the app run without Firebase configured.
 */
const path = require('path')
const fs   = require('fs')
const db   = require('../config/database')

let messaging = null  // firebase-admin messaging instance

function init() {
  if (messaging) return messaging
  const keyPath = process.env.FCM_SERVICE_ACCOUNT_KEY
  if (!keyPath) return null

  const resolved = path.resolve(keyPath)
  if (!fs.existsSync(resolved)) {
    console.warn('[FCM] Service account key not found at', resolved)
    return null
  }

  try {
    const admin          = require('firebase-admin')
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf8'))

    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    }

    messaging = admin.messaging()
    console.log('[FCM] Initialized — project:', serviceAccount.project_id)
    return messaging
  } catch (e) {
    console.warn('[FCM] Init failed:', e.message)
    return null
  }
}

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getTokens(userIds) {
  if (!userIds.length) return []
  const placeholders = userIds.map(() => '?').join(',')
  const [rows] = await db.query(
    `SELECT token FROM device_tokens WHERE user_id IN (${placeholders})`,
    userIds
  )
  return rows.map(r => r.token).filter(Boolean)
}

async function sendMulticast(tokens, { title, body, data = {} }) {
  if (!tokens.length) return
  const m = init()
  if (!m) return  // FCM not configured — skip silently

  // FCM sendEachForMulticast accepts max 500 tokens per call
  const chunks = []
  for (let i = 0; i < tokens.length; i += 500) chunks.push(tokens.slice(i, i + 500))

  const stringData = {}
  for (const [k, v] of Object.entries(data)) stringData[k] = String(v)

  for (const chunk of chunks) {
    try {
      const result = await m.sendEachForMulticast({
        tokens: chunk,
        notification: { title, body },
        data:         stringData,
        android: {
          priority: 'high',
          notification: { channelId: 'attendx_main', sound: 'default' },
        },
        apns: {
          payload: { aps: { sound: 'default', badge: 1 } },
        },
      })
      const failed = result.responses.filter(r => !r.success).length
      if (failed) console.warn(`[FCM] ${failed}/${chunk.length} messages failed`)
    } catch (e) {
      console.warn('[FCM] sendEachForMulticast error:', e.message)
    }
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Notify all enrolled students that a session has started.
 */
async function notifySessionStarted({ sessionId, courseId, courseName, room, sessionCode }) {
  try {
    const [rows] = await db.query(
      'SELECT student_id FROM enrollments WHERE course_id = ?', [courseId]
    )
    const tokens = await getTokens(rows.map(r => r.student_id))
    await sendMulticast(tokens, {
      title: 'Session Started',
      body:  `${courseName} in ${room} — tap to check in`,
      data:  { type: 'session_started', sessionId, courseId, courseName, room, sessionCode },
    })
  } catch (e) { console.warn('[FCM] notifySessionStarted:', e.message) }
}

/**
 * Notify absent students after a session is closed.
 */
async function notifyAbsentStudents({ sessionId, courseId }) {
  try {
    const [rows] = await db.query(
      `SELECT ar.student_id, c.name AS courseName
         FROM attendance_records ar
         JOIN attendance_sessions s ON s.id = ar.session_id
         JOIN courses c ON c.id = s.course_id
        WHERE ar.session_id = ? AND ar.status = 'absent'`,
      [sessionId]
    )
    if (!rows.length) return
    const courseName = rows[0].courseName
    const tokens = await getTokens(rows.map(r => r.student_id))
    await sendMulticast(tokens, {
      title: 'Absence Recorded',
      body:  `You were marked absent for ${courseName}`,
      data:  { type: 'absence_warning', sessionId, courseId, courseName },
    })
  } catch (e) { console.warn('[FCM] notifyAbsentStudents:', e.message) }
}

/**
 * Confirm to a single student that their check-in was recorded.
 */
async function notifyAttendanceConfirmed(studentId, courseName) {
  try {
    const tokens = await getTokens([studentId])
    await sendMulticast(tokens, {
      title: 'Attendance Confirmed',
      body:  `You have been marked present for ${courseName}`,
      data:  { type: 'attendance_confirmed', courseName },
    })
  } catch (e) { console.warn('[FCM] notifyAttendanceConfirmed:', e.message) }
}

module.exports = { init, notifySessionStarted, notifyAbsentStudents, notifyAttendanceConfirmed }
