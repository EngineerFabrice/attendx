import { useEffect, useState } from 'react'
import { Plus, Users, BookOpen } from 'lucide-react'
import api from '../services/api'

const DEPTS = ['Computer Science', 'Mathematics', 'Physics', 'Engineering']

function Modal({ lecturers, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ code: '', name: '', credits: 3, department: 'Computer Science', lecturerId: '' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-slate-800 text-lg mb-5">Create Course</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-3">
          <input required value={form.code} onChange={set('code')} placeholder="Course code (e.g. CS401)" className="input" />
          <input required value={form.name} onChange={set('name')} placeholder="Course name" className="input" />
          <input required type="number" value={form.credits} onChange={set('credits')} placeholder="Credits" min={1} max={6} className="input" />
          <select value={form.department} onChange={set('department')} className="input">
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={form.lecturerId} onChange={set('lecturerId')} className="input">
            <option value="">— Assign lecturer (optional) —</option>
            {lecturers.map(l => <option key={l.id} value={l.id}>{l.fullName}</option>)}
          </select>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Saving…' : 'Create Course'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [lecturers, setLecturers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get('/admin/courses'),
      api.get('/admin/users'),
    ]).then(([cr, ur]) => {
      setCourses(cr.data.data)
      setLecturers(ur.data.data.filter(u => u.role === 'lecturer'))
      setLoading(false)
    })
  }, [])

  async function handleCreate(form) {
    setSaving(true)
    try {
      const r = await api.post('/admin/courses', form)
      setCourses(c => [...c, r.data.data])
      setShowModal(false)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Course Management</h2>
          <p className="text-slate-500 text-sm mt-1">{courses.length} courses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(c => (
          <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600" />
              </div>
              <span className="badge badge-blue">{c.credits} cr.</span>
            </div>
            <h3 className="font-bold text-slate-800">{c.name}</h3>
            <p className="text-sm text-slate-400 font-mono mt-0.5">{c.code}</p>
            <p className="text-xs text-slate-400 mt-1">{c.department}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1 text-slate-500 text-sm">
                <Users size={14} />
                <span>{c.students} students</span>
              </div>
              <span className="text-xs text-slate-400">
                {c.lecturer ? c.lecturer.fullName : <span className="text-amber-500">No lecturer</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal
          lecturers={lecturers}
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          loading={saving}
        />
      )}
    </div>
  )
}
