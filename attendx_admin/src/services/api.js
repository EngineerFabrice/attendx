import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Inject JWT on every request ───────────────────────────────────────────────
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('attendx_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// ── Global response handling ──────────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      // Token expired or invalid — clear session and redirect to login
      localStorage.removeItem('attendx_token')
      localStorage.removeItem('attendx_user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
