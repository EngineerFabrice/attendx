import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, ArrowLeft } from 'lucide-react'
import api from '../services/api'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [devToken, setDevToken] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  async function requestReset(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const r = await api.post('/auth/forgot-password', { email })
      setDevToken(r.data.data?.resetToken || '')
      if (r.data.data?.resetToken) setToken(r.data.data.resetToken)
      setMsg(r.data.data?.message || 'Reset code sent.')
      setStep(2)
    } catch { setError('Something went wrong.') }
    finally { setLoading(false) }
  }

  async function resetPassword(e) {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setMsg('Password updated! You can now log in.')
      setStep(3)
    } catch { setError('Invalid or expired token.') }
    finally { setLoading(false) }
  }

  const inp = 'w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-400'

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-teal-800 to-slate-900 p-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500 shadow-lg mb-4">
            <GraduationCap size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        </div>

        <div className="glass rounded-2xl p-8 shadow-2xl">
          {step === 1 && (
            <form onSubmit={requestReset} className="space-y-4">
              <p className="text-emerald-200 text-sm">Enter your email and we'll generate a reset code.</p>
              {error && <p className="text-red-300 text-sm bg-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" className={inp} />
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                {loading ? 'Sending…' : 'Send Reset Code'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={resetPassword} className="space-y-4">
              <p className="text-emerald-200 text-sm">{msg}</p>
              {devToken && (
                <div className="bg-yellow-500/20 border border-yellow-400/40 rounded-lg px-3 py-2 text-yellow-200 text-xs">
                  Dev mode — token pre-filled: {devToken}
                </div>
              )}
              {error && <p className="text-red-300 text-sm bg-red-500/20 px-3 py-2 rounded-lg">{error}</p>}
              <input value={token} onChange={e => setToken(e.target.value)} placeholder="Reset code" className={inp} />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="New password (min 8 chars)" className={inp} />
              <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors">
                {loading ? 'Updating…' : 'Update Password'}
              </button>
              <button type="button" onClick={() => setStep(1)} className="w-full text-emerald-300 text-sm hover:underline">Back</button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center space-y-4">
              <p className="text-emerald-300">{msg}</p>
              <Link to="/login" className="block w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors text-center">
                Go to Login
              </Link>
            </div>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-emerald-400/70 text-sm mt-6 hover:text-emerald-300">
          <ArrowLeft size={14} /> Back to login
        </Link>
      </div>
    </div>
  )
}
