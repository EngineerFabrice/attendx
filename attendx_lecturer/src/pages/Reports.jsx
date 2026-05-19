import { useEffect, useState } from "react";
import { Download, AlertTriangle, Bell, Loader2, Smartphone, MessageCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

export default function Reports() {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingWarning, setSendingWarning] = useState(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [sendMethod, setSendMethod] = useState("both"); // 'push', 'sms', 'both'
  const [showMethodSelector, setShowMethodSelector] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/lecturer/students"), api.get("/lecturer/sessions")])
      .then(([s, sess]) => {
        console.log("Students API Response:", s.data);
        console.log("Response structure:", {
          hasData: !!s.data,
          dataIsArray: Array.isArray(s.data),
          dataDataIsArray: Array.isArray(s.data?.data),
          firstItem: s.data?.data?.[0],
        });

        // Check if data is directly in s.data or s.data.data
        let studentsRaw = [];
        if (Array.isArray(s.data)) {
          studentsRaw = s.data;
          console.log("Data is directly in response array");
        } else if (s.data?.data && Array.isArray(s.data.data)) {
          studentsRaw = s.data.data;
          console.log("Data is in response.data.data array");
        } else if (s.data?.students && Array.isArray(s.data.students)) {
          studentsRaw = s.data.students;
          console.log("Data is in response.data.students array");
        }

        console.log("First raw student:", studentsRaw[0]);
        console.log(
          "Available fields in first student:",
          studentsRaw[0] ? Object.keys(studentsRaw[0]) : [],
        );

        // Normalize student data
        const normalizedStudents = studentsRaw.map((student) => {
          console.log("Processing student:", student);
          return {
            id: student.id || student.student_id,
            fullName: student.fullName || student.full_name,
            regNumber: student.regNumber || student.reg_number,
            course: student.course || student.course_name || student.courseName,
            attendanceRate:
              student.attendanceRate || student.attendance_rate || 0,
            email: student.email,
            phone: student.phone || student.phone_number,
          };
        });

        console.log("Normalized students:", normalizedStudents);
        setStudents(normalizedStudents);
        setSessions(sess.data?.data || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("API Error:", error);
        setLoading(false);
      });
  }, []);

  const handleSendWarning = async (student) => {
    console.log("Student data being sent:", student);
    console.log("Send method:", sendMethod);

    try {
      setSendingWarning(student.id);

      // Validate required fields
      if (!student.id) {
        console.error("Missing student ID:", student);
        alert(`Cannot send warning: Missing student ID`);
        return;
      }

      if (!student.attendanceRate && student.attendanceRate !== 0) {
        console.error("Missing attendance rate:", student);
        alert(
          `Cannot send warning: Missing attendance rate for ${student.fullName}`,
        );
        return;
      }

      if (!student.course) {
        console.error("Missing course name:", student);
        alert(
          `Cannot send warning: Missing course information for ${student.fullName}`,
        );
        return;
      }

      // Check if SMS is selected but student has no phone number
      if ((sendMethod === "sms" || sendMethod === "both") && !student.phone) {
        alert(
          `Cannot send SMS to ${student.fullName}: No phone number registered. Please update student's contact info.`,
        );
        setSendingWarning(null);
        return;
      }

      const response = await api.post("/notifications/send-warning", {
        studentId: student.id,
        studentName: student.fullName,
        attendanceRate: student.attendanceRate,
        courseName: student.course,
        sendMethod: sendMethod, // Include notification method
        phoneNumber: student.phone, // Include phone for SMS
      });

      if (response.data.success) {
        const methodText = 
          sendMethod === "push" ? "Push notification" :
          sendMethod === "sms" ? "SMS" : "Push + SMS";
        
        alert(`✅ ${methodText} warning sent to ${student.fullName}`);
        
        // Show additional info if SMS was attempted
        if (response.data.smsSent !== undefined) {
          if (response.data.smsSent) {
            console.log(`SMS sent to ${student.phone}`);
          } else if (sendMethod !== "push") {
            alert(`Note: SMS could not be sent. Student may not have a valid phone number.`);
          }
        }

        setStudents((prevStudents) =>
          prevStudents.map((s) =>
            s.id === student.id
              ? { 
                  ...s, 
                  warningSent: true, 
                  lastWarningSent: new Date(),
                  lastWarningMethod: sendMethod 
                }
              : s,
          ),
        );
      }
    } catch (error) {
      console.error("Error sending warning:", error);
      alert(
        `Failed to send warning to ${student.fullName}. ${error.response?.data?.error || error.message}`,
      );
    } finally {
      setSendingWarning(null);
    }
  };

  const handleSendBulkWarnings = async () => {
    const atRiskStudents = students.filter((s) => s.attendanceRate < 75);
    
    // Filter by SMS capability if needed
    let studentsToNotify = atRiskStudents;
    if (sendMethod === "sms") {
      studentsToNotify = atRiskStudents.filter(s => s.phone);
      if (studentsToNotify.length === 0) {
        alert("No at-risk students have phone numbers registered for SMS");
        return;
      }
      if (studentsToNotify.length < atRiskStudents.length) {
        const skipped = atRiskStudents.length - studentsToNotify.length;
        if (!confirm(`${studentsToNotify.length} students have phone numbers. ${skipped} students without phone numbers will be skipped. Continue?`)) {
          return;
        }
      }
    }

    if (studentsToNotify.length === 0) {
      alert("No at-risk students found");
      return;
    }

    const methodText = 
      sendMethod === "push" ? "push notifications" :
      sendMethod === "sms" ? "SMS messages" : "push notifications and SMS";

    if (
      !confirm(`Send ${methodText} to ${studentsToNotify.length} at-risk students?`)
    ) {
      return;
    }

    setSendingBulk(true);

    try {
      const response = await api.post("/notifications/send-bulk-warnings", {
        students: studentsToNotify.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          attendanceRate: s.attendanceRate,
          course: s.course,
          phoneNumber: s.phone,
        })),
        sendMethod: sendMethod,
      });

      if (response.data.success) {
        let message = `✅ Sent: ${response.data.success}\n❌ Failed: ${response.data.failed}`;
        if (response.data.smsSent !== undefined) {
          message += `\n📱 SMS Sent: ${response.data.smsSent || 0}`;
        }
        if (response.data.pushSent !== undefined) {
          message += `\n🔔 Push Sent: ${response.data.pushSent || 0}`;
        }
        alert(message);
      }
    } catch (error) {
      console.error("Error sending bulk warnings:", error);
      alert("Failed to send bulk warnings");
    } finally {
      setSendingBulk(false);
    }
  };

  function exportCSV() {
    const headers = "Student,RegNumber,Course,AttendanceRate,Status,Phone,Email";
    const rows = students.map(
      (s) =>
        `"${s.fullName}",${s.regNumber || ""},${s.course},${s.attendanceRate}%,${s.attendanceRate >= 75 ? "Good" : "At Risk"},${s.phone || ""},${s.email || ""}`,
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendance_report.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const chartData = students.map((s) => ({
    name: s.fullName ? s.fullName.split(" ")[0] : "Student",
    rate: s.attendanceRate || 0,
  }));

  const atRisk = students.filter((s) => (s.attendanceRate || 0) < 75);
  const closedSessions = sessions.filter((s) => s.status === "closed");
  const avgAttendance =
    sessions.length > 0
      ? Math.round(
          closedSessions.reduce(
            (sum, s) => sum + (s.presentCount / s.totalStudents) * 100,
            0,
          ) / (closedSessions.length || 1),
        )
      : 0;

  if (loading)
    return (
      <div className="flex justify-center py-20 text-slate-400">Loading…</div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reports</h2>
          <p className="text-slate-500 text-sm mt-1">
            Attendance summaries and at-risk analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notification Method Selector */}
          <div className="relative">
            <button
              onClick={() => setShowMethodSelector(!showMethodSelector)}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
            >
              {sendMethod === "push" && <Bell size={14} />}
              {sendMethod === "sms" && <MessageCircle size={14} />}
              {sendMethod === "both" && <Smartphone size={14} />}
              <span>
                {sendMethod === "push" && "Push Only"}
                {sendMethod === "sms" && "SMS Only"}
                {sendMethod === "both" && "Push + SMS"}
              </span>
            </button>
            
            {showMethodSelector && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 z-10">
                <button
                  onClick={() => {
                    setSendMethod("push");
                    setShowMethodSelector(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 rounded-t-lg"
                >
                  <Bell size={14} />
                  <span>Push Only</span>
                </button>
                <button
                  onClick={() => {
                    setSendMethod("sms");
                    setShowMethodSelector(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <MessageCircle size={14} />
                  <span>SMS Only</span>
                </button>
                <button
                  onClick={() => {
                    setSendMethod("both");
                    setShowMethodSelector(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 rounded-b-lg"
                >
                  <Smartphone size={14} />
                  <span>Push + SMS</span>
                </button>
              </div>
            )}
          </div>

          {atRisk.length > 0 && (
            <button
              onClick={handleSendBulkWarnings}
              disabled={sendingBulk}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {sendingBulk ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Send to All ({atRisk.length})
                </>
              )}
            </button>
          )}
          <button
            onClick={exportCSV}
            className="btn-primary flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">Avg. Session Attendance</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {avgAttendance}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">Total Sessions</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">
            {closedSessions.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">At-Risk Students</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {atRisk.length}
          </p>
        </div>
      </div>

      {/* Notification method info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-700 flex items-center gap-2">
        <Smartphone size={16} />
        <span>
          {sendMethod === "push" && "Sending push notifications only (requires mobile app)"}
          {sendMethod === "sms" && "Sending SMS only (requires phone number)"}
          {sendMethod === "both" && "Sending both push notifications and SMS for delivery redundancy"}
        </span>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">
          Student Attendance Rates
        </h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2664eb" }} />
            <YAxis
              domain={[0, 100]}
              unit="%"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <Tooltip formatter={(v) => `${v}%`} />
            <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* At-risk table */}
      {atRisk.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-semibold text-slate-800">
              At-Risk Students (below 75%)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="th">Student</th>
                  <th className="th">Course</th>
                  <th className="th">Attendance Rate</th>
                  <th className="th">Phone</th>
                  <th className="th">Action Needed</th>
                </tr>
              </thead>
              <tbody>
                {atRisk.map((s) => (
                  <tr key={s.id} className="border-b border-slate-50">
                    <td className="td font-medium text-slate-800">
                      {s.fullName}
                    </td>
                    <td className="td">
                      <span className="badge badge-blue">{s.course}</span>
                    </td>
                    <td className="td">
                      <span className="text-red-600 font-bold">
                        {s.attendanceRate}%
                      </span>
                    </td>
                    <td className="td">
                      {s.phone ? (
                        <span className="text-green-600 text-xs">{s.phone}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No phone</span>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSendWarning(s)}
                          disabled={sendingWarning === s.id}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingWarning === s.id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              {sendMethod === "sms" ? <MessageCircle size={14} /> : <Bell size={14} />}
                              Send Warning
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Session history */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Session History</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="th">Course</th>
              <th className="th">Date</th>
              <th className="th">Present / Total</th>
              <th className="th">Rate</th>
             </tr>
          </thead>
          <tbody>
            {closedSessions.map((s) => {
              const rate = Math.round((s.presentCount / s.totalStudents) * 100);
              return (
                <tr
                  key={s.id}
                  className="border-b border-slate-50 hover:bg-slate-50"
                >
                  <td className="td font-medium text-slate-800">
                    {s.course?.name || s.course_name || "Unknown"}
                  </td>
                  <td className="td text-slate-500">
                    {new Date(s.startedAt || s.started_at).toLocaleDateString()}
                  </td>
                  <td className="td">
                    {s.presentCount || s.present_count} /{" "}
                    {s.totalStudents || s.total_students}
                  </td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-20">
                        <div
                          className={`h-full rounded-full ${rate >= 75 ? "bg-emerald-500" : "bg-red-500"}`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span
                        className={`font-semibold text-sm ${rate >= 75 ? "text-emerald-600" : "text-red-600"}`}
                      >
                        {rate}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}