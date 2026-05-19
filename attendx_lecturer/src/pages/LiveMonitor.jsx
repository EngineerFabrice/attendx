import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  MapPin,
  Clock,
  XCircle,
  Wifi,
  Bell,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { io } from "socket.io-client";
import api from "../services/api";

export default function LiveMonitor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sessionClosed, setSessionClosed] = useState(false);
  const [sendingReminder, setSendingReminder] = useState(null);
  const [sendingBulkReminder, setSendingBulkReminder] = useState(false);
  const [absentStudents, setAbsentStudents] = useState([]);
  const socketRef = useRef(null);
  // Fetch all enrolled students to determine absent ones
  const fetchEnrolledStudents = useCallback(
    async (currentRecords) => {
      try {
        const response = await api.get(
          `/lecturer/sessions/${id}/enrolled-students`,
        );
        const allStudents = response.data.data || [];
        const presentIds = new Set(
          currentRecords.map((r) => r.student?.id || r.student_id),
        );
        const absent = allStudents.filter((s) => !presentIds.has(s.id));
        setAbsentStudents(absent);
      } catch (error) {
        console.error("Error fetching enrolled students:", error);
      }
    },
    [id],
  );

  useEffect(() => {
    // Load initial attendance data via HTTP
    api
      .get(`/lecturer/sessions/${id}/attendance`)
      .then((r) => {
        const sessionData = r.data.data;
        const recordsList = Array.isArray(sessionData)
          ? sessionData
          : sessionData.records || [];
        setRecords(recordsList);
        if (sessionData.totalStudents)
          setTotalStudents(sessionData.totalStudents);

        // Get absent students (you may need to fetch enrolled students)
        // call via ref-stable function declared below
        fetchEnrolledStudents(recordsList);

        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Connect Socket.IO for real-time updates
    const socketUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:5000/api"
    ).replace("/api", "");
    const socket = io(socketUrl, {
      auth: { token: localStorage.getItem("attendx_token") },
    });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    // Join the session room to receive targeted events
    socket.emit("join_session", { sessionId: id });

    // Real-time check-in: prepend new record to the list
    socket.on("attendance_update", (record) => {
      setRecords((prev) => {
        if (prev.some((r) => r.id === record.id)) return prev;
        return [record, ...prev];
      });
    });

    // Session was closed externally
    socket.on("session_closed", () => {
      setSessionClosed(true);
    });

    // Elapsed timer
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);

    return () => {
      socket.disconnect();
      clearInterval(timer);
    };
  }, [fetchEnrolledStudents, id]);

  // Send reminder to a single absent student
  const sendReminder = async (student) => {
    try {
      setSendingReminder(student.id);

      await api.post("/notifications/send-warning", {
        studentId: student.id,
        studentName: student.fullName,
        attendanceRate: 0,
        courseName: "this session",
      });

      alert(`📱 Reminder sent to ${student.fullName}`);
    } catch (error) {
      console.error("Error sending reminder:", error);
      alert(
        `Failed to send reminder: ${error.response?.data?.error || error.message}`,
      );
    } finally {
      setSendingReminder(null);
    }
  };

  // Send bulk reminders to all absent students
  const sendBulkReminders = async () => {
    if (absentStudents.length === 0) {
      alert("No absent students to notify");
      return;
    }

    if (
      !confirm(`Send reminders to ${absentStudents.length} absent students?`)
    ) {
      return;
    }

    setSendingBulkReminder(true);

    try {
      const response = await api.post("/notifications/send-bulk-warnings", {
        students: absentStudents.map((s) => ({
          id: s.id,
          fullName: s.fullName,
          attendanceRate: 0,
          course: "this session",
        })),
      });

      alert(
        `✅ Sent ${response.data.success} reminders\n❌ Failed: ${response.data.failed}`,
      );
    } catch (error) {
      console.error("Error sending bulk reminders:", error);
      alert("Failed to send bulk reminders");
    } finally {
      setSendingBulkReminder(false);
    }
  };

  async function handleClose() {
    if (
      !confirm("End this session? Students will no longer be able to check in.")
    )
      return;
    await api.post(`/lecturer/sessions/${id}/close`);
    navigate("/sessions");
  }

  const presentCount = records.filter((r) => r.status === "present").length;
  const attendanceRate =
    totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  function formatElapsed(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  if (loading)
    return (
      <div className="flex justify-center py-20 text-slate-400">
        Loading session…
      </div>
    );

  return (
    <div className="space-y-5">
      {/* Session closed banner */}
      {sessionClosed && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl text-sm font-medium">
          This session has been closed. Students can no longer check in.
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
            />
            <h2 className="text-xl font-bold text-slate-800">Live Monitor</h2>
            {socketConnected && (
              <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{" "}
                Connected
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {sessionClosed
              ? "Session ended"
              : "Session is active — students can check in now"}
          </p>
        </div>
        {!sessionClosed && (
          <button
            onClick={handleClose}
            className="btn-danger flex items-center gap-2"
          >
            <XCircle size={16} /> End Session
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Users size={15} />
            Checked In
          </div>
          <p className="text-3xl font-bold text-slate-800">{presentCount}</p>
          <p className="text-slate-400 text-xs mt-0.5">
            of {totalStudents} students
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <MapPin size={15} />
            Geofence
          </div>
          <p className="text-3xl font-bold text-emerald-600">30m</p>
          <p className="text-slate-400 text-xs mt-0.5">Active radius</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Clock size={15} />
            Duration
          </div>
          <p className="text-3xl font-bold text-slate-800 font-mono">
            {formatElapsed(elapsed)}
          </p>
          <p className="text-slate-400 text-xs mt-0.5">HH:MM</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Wifi size={15} />
            Attendance
          </div>
          <p
            className={`text-3xl font-bold ${attendanceRate >= 75 ? "text-emerald-600" : "text-orange-500"}`}
          >
            {attendanceRate}%
          </p>
          <p className="text-slate-400 text-xs mt-0.5">Real-time</p>
        </div>
      </div>

      {/* Absent students section with individual and bulk reminders */}
      {!sessionClosed && absentStudents.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="bg-orange-50 border-b border-orange-200 px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-600" />
              <span className="font-semibold text-orange-800">
                {absentStudents.length} student
                {absentStudents.length !== 1 ? "s" : ""} haven't checked in
              </span>
            </div>
            <button
              onClick={sendBulkReminders}
              disabled={sendingBulkReminder}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {sendingBulkReminder ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell size={16} />
                  Send All
                </>
              )}
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {absentStudents.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors last:border-b-0"
              >
                <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-red-700 font-bold text-sm">
                  {s.fullName?.[0] || "S"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">
                    {s.fullName}
                  </p>
                  <p className="text-slate-400 text-xs">{s.regNumber}</p>
                </div>
                <button
                  onClick={() => sendReminder(s)}
                  disabled={sendingReminder === s.id}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {sendingReminder === s.id ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Bell size={14} />
                      Remind
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance progress */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Attendance Progress</h3>
          <span
            className={`text-sm font-bold ${attendanceRate >= 75 ? "text-emerald-600" : "text-orange-500"}`}
          >
            {attendanceRate}%
          </span>
        </div>
        <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${attendanceRate >= 75 ? "bg-emerald-500" : "bg-orange-400"}`}
            style={{ width: `${attendanceRate}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400 mt-1.5">
          <span>0%</span>
          <span className="text-orange-500">75% minimum</span>
          <span>100%</span>
        </div>
      </div>

      {/* Check-in list */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-800">
            Check-ins ({presentCount})
          </h3>
          <div
            className={`flex items-center gap-1.5 text-sm ${socketConnected ? "text-emerald-600" : "text-slate-400"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${socketConnected ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
            />
            {socketConnected ? "Live updates" : "Reconnecting…"}
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {records.length === 0 ? (
            <p className="text-center py-10 text-slate-400">
              Waiting for check-ins…
            </p>
          ) : (
            records.map((r) => (
              <div
                key={r.id}
                className="flex items-center gap-4 px-5 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  {r.student?.fullName?.[0] || r.student_name?.[0] || "S"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-800 text-sm">
                    {r.student?.fullName || r.student_name}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {r.student?.regNumber || r.reg_number}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {r.checkedInAt
                      ? new Date(r.checkedInAt).toLocaleTimeString()
                      : "—"}
                  </p>
                  <p className="text-xs text-slate-400">
                    {r.distanceM || 0}m from classroom
                  </p>
                </div>
                <span className="badge badge-green">Present</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
