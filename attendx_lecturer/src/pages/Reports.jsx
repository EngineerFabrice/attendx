import { useEffect, useState } from 'react'
import { Download, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'

export default function Reports() {
  const [students, setStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/lecturer/students'), api.get('/lecturer/sessions')]).then(([s, sess]) => {
      setStudents(s.data.data); setSessions(sess.data.data); setLoading(false)
    })
  }, [])

  function exportCSV() {
    const headers = 'Student,RegNumber,Course,AttendanceRate,Status'
    const rows = students.map(s =>
      `"${s.fullName}",${s.regNumber},${s.course},${s.attendanceRate}%,${s.attendanceRate >= 75 ? 'Good' : 'At Risk'}`
    )
    const csv = [headers, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'attendance_report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const chartData = students.map(s => ({ name: s.fullName.split(' ')[0], rate: s.attendanceRate }))
  const atRisk = students.filter(s => s.attendanceRate < 75)
  const closedSessions = sessions.filter(s => s.status === 'closed')
  const avgAttendance = sessions.length > 0
    ? Math.round(closedSessions.reduce((sum, s) => sum + (s.presentCount / s.totalStudents) * 100, 0) / (closedSessions.length || 1))
    : 0

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading…</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Reports</h2>
          <p className="text-slate-500 text-sm mt-1">Attendance summaries and at-risk analysis</p>
        </div>
        <button onClick={exportCSV} className="btn-primary flex items-center gap-2">
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">Avg. Session Attendance</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{avgAttendance}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">Total Sessions</p>
          <p className="text-3xl font-bold text-slate-800 mt-1">{closedSessions.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">At-Risk Students</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{atRisk.length}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="font-semibold text-slate-800 mb-4">Student Attendance Rates</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip formatter={v => `${v}%`} />
            <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* At-risk table */}
      {atRisk.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-orange-500" />
            <h3 className="font-semibold text-slate-800">At-Risk Students (below 75%)</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="th">Student</th>
                <th className="th">Course</th>
                <th className="th">Attendance Rate</th>
                <th className="th">Action Needed</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map(s => (
                <tr key={s.id} className="border-b border-slate-50">
                  <td className="td font-medium text-slate-800">{s.fullName}</td>
                  <td className="td"><span className="badge badge-blue">{s.course}</span></td>
                  <td className="td">
                    <span className="text-red-600 font-bold">{s.attendanceRate}%</span>
                  </td>
                  <td className="td">
                    <span className="text-orange-600 text-sm">Send absence warning</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            {closedSessions.map(s => {
              const rate = Math.round((s.presentCount / s.totalStudents) * 100)
              return (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50">
                  <td className="td font-medium text-slate-800">{s.course.name}</td>
                  <td className="td text-slate-500">{new Date(s.startedAt).toLocaleDateString()}</td>
                  <td className="td">{s.presentCount} / {s.totalStudents}</td>
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-20">
                        <div className={`h-full rounded-full ${rate >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{ width: `${rate}%` }} />
                      </div>
                      <span className={`font-semibold text-sm ${rate >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>{rate}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
