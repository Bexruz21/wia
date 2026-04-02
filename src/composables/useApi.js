import axios from 'axios'

const api = axios.create({
  baseURL: 'https://d389-213-230-87-51.ngrok-free.app/api/v1',
  headers: { 
    'Content-Type': 'application/json',
    "ngrok-skip-browser-warning": "69420"
   }
})

// Attach token from localStorage on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vt_access')
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Also attach Telegram initData if available
  const initData = window.Telegram?.WebApp?.initData
  if (initData && !token) {
    config.headers.Authorization = `TgWebApp ${encodeURIComponent(initData)}`
  }
  return config
})

// Auto-refresh on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('vt_refresh')
      if (refresh) {
        try {
          const { data } = await axios.post('/api/v1/auth/token/refresh/', { refresh })
          localStorage.setItem('vt_access', data.access)
          original.headers.Authorization = `Bearer ${data.access}`
          return api(original)
        } catch {
          localStorage.removeItem('vt_access')
          localStorage.removeItem('vt_refresh')
        }
      }
    }
    return Promise.reject(err)
  }
)

export default api
