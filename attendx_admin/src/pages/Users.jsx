import { useEffect, useState } from 'react'
import { Plus, Trash2, Search, UserCheck, UserX } from 'lucide-react'
import api from '../services/api'

const ROLES = ['student', 'lecturer', 'admin']
const DEPTS = ['Computer Science', 'Mathematics', 'Physics', 'Engineering']

function Modal({ title, onClose, onSubmit, loading }) {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'student', department: 'Computer Science' })
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-slate-800 text-lg mb-5">{title}</h3>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-3">
          <input required value={form.fullName} onChange={set('fullName')} placeholder="Full name" className="input" />
          <input required type="email" value={form.email} onChange={set('email')} placeholder="Email" className="input" />
          <input required value={form.password} onChange={set('password')} placeholder="Password" type="password" className="input" />
          <select value={form.role} onChange={set('role')} className="input">
            {ROLES.map(r => <option key={r}>{r}</option>)}
          </select>
          <select value={form.department} onChange={set('department')} className="input">
            {DEPTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 btn-primary">{loading ? 'Saving…' : 'Create User'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    api.get('/admin/users').then(r => { setUsers(r.data.data); setLoading(false) })
  }, [])

  async function handleCreate(form) {
    setSaving(true)
    const r = await api.post('/admin/users', form)
    setUsers(u => [...u, r.data.data])
    setShowModal(false)
    setSaving(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this user?')) return
    await api.delete(`/admin/users/${id}`)
    setUsers(u => u.filter(x => x.id !== id))
  }

  const filtered = users.filter(u => {
    const matchSearch = u.fullName.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    return matchSearch && matchRole
  })

  if (loading) return <div className="flex justify-center py-20 text-slate-400">Loading…</div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="input pl-9" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="input w-36">
          <option value="all">All roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="th">Name</th>
              <th className="th">Email</th>
              <th className="th">Role</th>
              <th className="th">Department</th>
              <th className="th">Status</th>
              <th className="th">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                <td className="td font-medium text-slate-800">{u.fullName}</td>
                <td className="td text-slate-500">{u.email}</td>
                <td className="td">
                  <span className={`badge ${u.role === 'admin' ? 'badge-blue' : u.role === 'lecturer' ? 'badge-violet' : 'badge-gray'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="td text-slate-500">{u.department}</td>
                <td className="td">
                  {u.isActive
                    ? <span className="flex items-center gap-1 text-emerald-600 text-sm"><UserCheck size={14} /> Active</span>
                    : <span className="flex items-center gap-1 text-slate-400 text-sm"><UserX size={14} /> Inactive</span>}
                </td>
                <td className="td">
                  <button onClick={() => handleDelete(u.id)} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-10 text-slate-400">No users found</p>}
      </div>

      {showModal && <Modal title="Create User" onClose={() => setShowModal(false)} onSubmit={handleCreate} loading={saving} />}
    </div>
  )
}
