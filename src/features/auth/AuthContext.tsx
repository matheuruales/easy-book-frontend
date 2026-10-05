import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { api } from '../../lib/api'
import { SESSION_STORAGE_KEY } from '../../lib/session'
import type { AuthResponse } from '../../types/api'

interface LoginInput { email: string; password: string }
interface RegistroClienteInput {
  nombre: string
  email: string
  telefono: string
  password: string
}

interface AuthContextValue {
  session: AuthResponse | null
  login: (input: LoginInput) => Promise<void>
  registrarCliente: (input: RegistroClienteInput) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)
function readSession(): AuthResponse | null {
  try {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthResponse | null>(readSession)

  const saveSession = useCallback((next: AuthResponse) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const login = useCallback(async (input: LoginInput) => {
    const { data } = await api.post<AuthResponse>('/auth/login', input)
    saveSession(data)
  }, [saveSession])

  const registrarCliente = useCallback(async (input: RegistroClienteInput) => {
    const { data } = await api.post<AuthResponse>('/auth/registro-cliente', input)
    saveSession(data)
  }, [saveSession])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
  }, [])

  useEffect(() => {
    window.addEventListener('barberia:session-expired', logout)
    return () => window.removeEventListener('barberia:session-expired', logout)
  }, [logout])

  const value = useMemo(() => ({ session, login, registrarCliente, logout }),
    [session, login, registrarCliente, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  return context
}
