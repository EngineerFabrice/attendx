import { useEffect, useState } from 'react'
import { Users, BookOpen, Radio, TrendingUp, AlertTriangle } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data.data))
  }, [])

  if (!data) return <div className="flex justify-center py-20 text-slate-400">Loading…</div>

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Overview</h2>
        <p className="text-slate-500 text-sm mt-1">System-wide attendance statistics</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={data.totalUsers} color="bg-blue-600" sub="Students + Lecturers" />
        <StatCard icon={BookOpen} label="Active Courses" value={data.totalCourses} color="bg-emerald-600" />
        <StatCard icon={Radio} label="Live Sessions" value={data.activeSessions} color="bg-orange-500" sub="Right now" />
        <StatCard icon={TrendingUp} label="Avg. Attendance" value={`${data.overallAttendanceRate}%`} color="bg-violet-600" />
      </div>

      {/* Chart */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="font-semibold text-slate-800 mb-4">Attendance Trend (8 weeks)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} unit="%" />
              <Tooltip formatter={v => `${v}%`} />
              <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* At-risk */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-orange-500" />
            <h3 className="font-semibold text-slate-800">At-Risk Students</h3>
          </div>
          <div className="space-y-3">
            {data.atRisk.map((r, i) => (
              <div key={i} className="p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="font-medium text-slate-800 text-sm">{r.student}</p>
                <p className="text-xs text-slate-500">{r.course}</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${r.rate}%` }} />
                  </div>
                  <span className="text-red-600 text-xs font-semibold">{r.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
