import { useState } from 'react'
import { Save, Bell, Clock, Database, Shield } from 'lucide-react'

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-11 h-6 rounded-full transition-colors ${value ? 'bg-blue-600' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${value ? 'translate-x-5' : ''}`} />
    </button>
  )
}

export default function Settings() {
  const [notifs, setNotifs] = useState({ sessionStart: true, absenceAlert: true, lowAttendance: true, weeklyReport: false })
  const [timeout, setTimeout_] = useState(60)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-800">System Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure global system behaviour</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-800">Notification Settings</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: 'sessionStart', label: 'Session start alerts', desc: 'Notify students when a session starts' },
            { key: 'absenceAlert', label: 'Absence alerts', desc: 'Alert lecturers when attendance drops' },
            { key: 'lowAttendance', label: 'Low attendance warnings', desc: 'Warn students below 75% threshold' },
            { key: 'weeklyReport', label: 'Weekly digest', desc: 'Send weekly summary emails to admins' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-slate-700 font-medium text-sm">{label}</p>
                <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
              </div>
              <Toggle value={notifs[key]} onChange={v => setNotifs(n => ({ ...n, [key]: v }))} />
            </div>
          ))}
        </div>
      </div>

      {/* Session timeout */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-800">Session Configuration</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-slate-600 text-sm">JWT Token Expiration (minutes)</label>
            <input
              type="number"
              value={timeout}
              onChange={e => setTimeout_(e.target.value)}
              min={15}
              max={1440}
              className="input mt-1.5"
            />
          </div>
          <div className="flex-1">
            <label className="text-slate-600 text-sm">Default Geofence Radius (meters)</label>
            <input type="number" defaultValue={30} min={10} max={200} className="input mt-1.5" />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-800">Security</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-slate-700 font-medium text-sm">Two-factor authentication</p>
              <p className="text-slate-400 text-xs">Require 2FA for admin accounts</p>
            </div>
            <Toggle value={false} onChange={() => {}} />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-slate-700 font-medium text-sm">Device fingerprinting</p>
              <p className="text-slate-400 text-xs">Track student check-in devices</p>
            </div>
            <Toggle value={true} onChange={() => {}} />
          </div>
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <Database size={18} className="text-blue-600" />
          <h3 className="font-semibold text-slate-800">Data Backup</h3>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary">Export CSV</button>
          <button className="btn-secondary">Export JSON</button>
          <button className="btn-secondary text-orange-600 border-orange-200 hover:bg-orange-50">Clear Old Sessions</button>
        </div>
      </div>

      <button onClick={handleSave} className="btn-primary flex items-center gap-2">
        <Save size={16} />
        {saved ? 'Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
