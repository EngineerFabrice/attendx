import { useEffect, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import api from '../services/api'

export default function Analytics() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data.data))
  }, [])

  if (!data) return <div className="flex justify-center py-20 text-slate-400">Loading…</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Analytics</h2>
        <p className="text-slate-500 text-sm mt-1">System-wide attendance insights</p>
      </div>

      {/* Overall rate */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <p className="text-blue-200 text-sm">Overall System Attendance Rate</p>
        <p className="text-5xl font-bold mt-1">{data.overallAttendanceRate}%</p>
        <div className="mt-4 h-2 bg-blue-500/40 rounded-full overflow-hidden">
          <div className="h-full bg-white/80 rounded-full" style={{ width: `${data.overallAttendanceRate}%` }} />
        </div>
        <p className="text-blue-200 text-xs mt-2">Target: 75% minimum</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Weekly trend */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Weekly Attendance Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <Tooltip formatter={v => `${v}%`} />
              <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Per-course */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Attendance by Course</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.courseAttendance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis type="category" dataKey="name" width={60} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={v => `${v}%`} />
              <Bar dataKey="rate" fill="#3b82f6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* At-risk table */}
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
              <th className="th">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.atRisk.map((r, i) => (
              <tr key={i} className="border-b border-slate-50">
                <td className="td font-medium text-slate-800">{r.student}</td>
                <td className="td text-slate-500">{r.course}</td>
                <td className="td">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-24">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: `${r.rate}%` }} />
                    </div>
                    <span className="text-red-600 font-semibold text-sm">{r.rate}%</span>
                  </div>
                </td>
                <td className="td"><span className="badge badge-red">At Risk</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
