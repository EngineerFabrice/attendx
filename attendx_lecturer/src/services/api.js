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

// ── Token refresh logic ───────────────────────────────────────────────────────
let isRefreshing = false

function clearAuthAndRedirect() {
  localStorage.removeItem('attendx_token')
  localStorage.removeItem('attendx_refresh_token')
  localStorage.removeItem('attendx_user')
  window.location.href = '/login'
}

// ── Global response handling ──────────────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite retry loops
      if (isRefreshing) {
        clearAuthAndRedirect()
        return Promise.reject(err)
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('attendx_refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        clearAuthAndRedirect()
        return Promise.reject(err)
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        const newToken = res.data.data?.tokens?.accessToken || res.data.data?.accessToken
        localStorage.setItem('attendx_token', newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        isRefreshing = false
        return api(originalRequest)
      } catch {
        isRefreshing = false
        clearAuthAndRedirect()
        return Promise.reject(err)
      }
    }

    return Promise.reject(err)
  }
)

export default api
