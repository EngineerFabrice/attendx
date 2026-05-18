import { useEffect, useState } from 'react'
import { BookOpen, BarChart2, PlayCircle, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-slate-500 text-sm">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/lecturer/dashboard')
      .then(r => setData(r.data.data))
      .catch(err => setError(err.response?.data?.error || 'Request failed'))
  }, [])

  if (!data && !error) return <div className="flex justify-center py-20 text-slate-400">Loading…</div>

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          <span className="text-sm">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 text-red-500 hover:text-red-700 font-bold text-lg leading-none">&times;</button>
        </div>
      )}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Welcome back!</h2>
        <p className="text-slate-500 text-sm mt-1">Here's your teaching overview for today.</p>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard icon={BookOpen} label="My Courses" value={data.courses.length} color="bg-blue-600" />
            <StatCard icon={BarChart2} label="Avg. Attendance" value={`${data.overallAttendance}%`} color="bg-emerald-600" />
            <StatCard icon={PlayCircle} label="Total Sessions" value={data.totalSessions} color="bg-violet-600" />
            <StatCard icon={Clock} label="Today's Classes" value={data.todaySchedule.length} color="bg-orange-500" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Today's schedule */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">Today's Schedule</h3>
              {data.todaySchedule.length === 0
                ? <p className="text-slate-400 text-sm">No classes scheduled for today.</p>
                : data.todaySchedule.map((cls, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 mb-2 last:mb-0">
                    <div className="text-center w-16">
                      <p className="font-bold text-slate-800 text-sm">{cls.time}</p>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{cls.course}</p>
                      <p className="text-slate-400 text-xs">{cls.room} · {cls.students} students</p>
                    </div>
                    <button
                      onClick={() => navigate('/sessions')}
                      className="btn-primary text-xs py-1.5 px-3"
                    >
                      Start
                    </button>
                  </div>
                ))
              }
            </div>

            {/* My courses */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-semibold text-slate-800 mb-4">My Courses</h3>
              <div className="space-y-2">
                {data.courses.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <BookOpen size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 text-sm">{c.name}</p>
                      <p className="text-slate-400 text-xs">{c.code} · {c.students} students</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
