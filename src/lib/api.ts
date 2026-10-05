import axios from 'axios'
import { SESSION_STORAGE_KEY } from './session'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const rawSession = sessionStorage.getItem(SESSION_STORAGE_KEY)
  if (rawSession) {
    const { token } = JSON.parse(rawSession) as { token: string }
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY)
      window.dispatchEvent(new Event('barberia:session-expired'))
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.detail ?? 'No pudimos conectar con el servidor.'
  }
  return 'Ocurrió un error inesperado.'
}
