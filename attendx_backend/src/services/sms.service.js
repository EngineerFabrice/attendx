const twilio = require('twilio');

let twilioClient = null;
let isConfigured = false;

/**
 * Initialize Twilio client
 */
function init() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !phoneNumber) {
    console.warn('[SMS] Twilio credentials missing - SMS disabled');
    console.warn('[SMS] Required: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    return null;
  }

  try {
    twilioClient = twilio(accountSid, authToken);
    isConfigured = true;
    console.log('[SMS] ✅ Twilio initialized - Phone:', phoneNumber);
    return twilioClient;
  } catch (error) {
    console.error('[SMS] Failed to initialize Twilio:', error.message);
    return null;
  }
}

/**
 * Send SMS to a single recipient
 * @param {string} to - Recipient phone number (E.164 format: +2507XXXXXXXX)
 * @param {string} message - SMS message content
 * @returns {Promise<object>} - Twilio message response
 */
async function sendSMS(to, message) {
  if (!isConfigured) {
    console.warn('[SMS] SMS not configured - message not sent');
    return null;
  }

  try {
    const phoneNumber = process.env.TWILIO_PHONE_NUMBER;
    
    const result = await twilioClient.messages.create({
      body: message,
      to: to,
      from: phoneNumber,
    });

    console.log(`[SMS] ✅ Sent to ${to}: ${result.sid}`);
    return result;
  } catch (error) {
    console.error(`[SMS] Failed to send to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Send attendance warning via SMS
 * @param {Object} params - Warning parameters
 * @param {string} params.phoneNumber - Student's phone number
 * @param {string} params.studentName - Student's full name
 * @param {number} params.attendanceRate - Current attendance rate
 * @param {string} params.courseName - Course name
 * @returns {Promise<object>}
 */
async function sendAbsenceWarningSMS({ phoneNumber, studentName, attendanceRate, courseName }) {
  if (!phoneNumber) {
    console.warn('[SMS] No phone number provided for student');
    return null;
  }

  // Format phone number to E.164 if needed
  let formattedNumber = phoneNumber;
  if (!phoneNumber.startsWith('+')) {
    // Assume Rwanda format (starting with 07...)
    if (phoneNumber.startsWith('07')) {
      formattedNumber = '+250' + phoneNumber.substring(1);
    } else if (phoneNumber.startsWith('25')) {
      formattedNumber = '+' + phoneNumber;
    } else {
      formattedNumber = '+250' + phoneNumber;
    }
  }

  const message = `⚠️ Attendance Warning - ${courseName}

Dear ${studentName}, your attendance is at ${attendanceRate}%. Please attend more classes to avoid academic penalties.

- AttendX System`;

  return await sendSMS(formattedNumber, message);
}

/**
 * Send session reminder SMS
 * @param {Object} params
 * @param {string} params.phoneNumber - Student's phone number
 * @param {string} params.studentName - Student's name
 * @param {string} params.courseName - Course name
 * @param {string} params.room - Classroom name
 * @param {string} params.sessionCode - Session check-in code
 * @returns {Promise<object>}
 */
async function sendSessionReminderSMS({ phoneNumber, studentName, courseName, room, sessionCode }) {
  if (!phoneNumber) {
    return null;
  }

  let formattedNumber = phoneNumber;
  if (!phoneNumber.startsWith('+')) {
    if (phoneNumber.startsWith('07')) {
      formattedNumber = '+250' + phoneNumber.substring(1);
    } else {
      formattedNumber = '+250' + phoneNumber;
    }
  }

  const message = `📚 Session Started: ${courseName}

Location: ${room}
Check-in Code: ${sessionCode}

Open the AttendX app to check in now!`;

  return await sendSMS(formattedNumber, message);
}

/**
 * Send bulk SMS warnings to multiple students
 * @param {Array} students - Array of student objects with phoneNumber, fullName, attendanceRate, course
 * @returns {Promise<Object>} - Results summary
 */
async function sendBulkSMSWarnings(students) {
  const results = { success: 0, failed: 0, details: [] };
  
  for (const student of students) {
    try {
      if (!student.phoneNumber) {
        console.warn(`[SMS] No phone for ${student.fullName}`);
        results.failed++;
        results.details.push({ name: student.fullName, status: 'no_phone' });
        continue;
      }
      
      await sendAbsenceWarningSMS({
        phoneNumber: student.phoneNumber,
        studentName: student.fullName,
        attendanceRate: student.attendanceRate,
        courseName: student.course
      });
      
      results.success++;
      results.details.push({ name: student.fullName, status: 'sent' });
      
      // Rate limiting: delay between SMS (Twilio limit: ~1 per second)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`[SMS] Failed for ${student.fullName}:`, error.message);
      results.failed++;
      results.details.push({ name: student.fullName, status: 'failed', error: error.message });
    }
  }
  
  console.log(`[SMS] Bulk complete: ${results.success} sent, ${results.failed} failed`);
  return results;
}

module.exports = {
  init,
  sendSMS,
  sendAbsenceWarningSMS,
  sendSessionReminderSMS,
  sendBulkSMSWarnings,
  isConfigured: () => isConfigured,
};