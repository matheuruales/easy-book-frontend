import { useState } from 'react'
import type { FormEvent } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, CalendarCheck, Check, Moon, Scissors, ShieldCheck, Sun } from 'lucide-react'
import { useAuth } from './AuthContext'
import { useTheme } from '../theme/ThemeContext'
import { getApiError } from '../../lib/api'

type Mode = 'login' | 'registro'

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, registrarCliente } = useAuth()
  const { theme, toggleTheme } = useTheme()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError('')
    const values = Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string>
    try {
      if (mode === 'login') {
        await login({ email: values.email, password: values.password })
      } else {
        await registrarCliente({
          nombre: values.nombre,
          email: values.email,
          telefono: values.telefono,
          password: values.password,
        })
      }
    } catch (requestError) {
      setError(getApiError(requestError))
    } finally {
      setLoading(false)
    }
  }

  const copy = mode === 'login'
    ? ['Bienvenido de nuevo', 'Ingresa para continuar con tu día.']
    : ['Crea tu cuenta', 'Reserva tu próxima visita en pocos pasos.']

  return (
    <main className="auth-page">
      <section className="auth-story" aria-label="Presentación">
        <img className="auth-story-image" src="/images/navaja-master-barber.webp" alt="Barbero maestro de Navaja en el interior de la barbería" />
        <div className="brand brand--light"><span className="brand-mark"><Scissors size={18} /></span>Navaja</div>
        <div className="story-copy">
          <span className="eyebrow eyebrow--light">Desde 2026 · Cúcuta</span>
          <h1>El oficio<br />bien hecho.</h1>
          <p>Una sola marca. Cada sede, cada barbero y cada cita conectados por la misma forma de hacer las cosas.</p>
          <div className="story-points">
            <span><CalendarCheck size={15} /> Agenda sin cruces</span>
            <span><ShieldCheck size={15} /> Información protegida</span>
            <span><Check size={15} /> Reservas en segundos</span>
          </div>
        </div>
        <div className="story-preview" aria-hidden="true">
          <span className="preview-dot" />
          <div><small>Próxima cita</small><strong>Hoy · 4:30 p. m.</strong></div>
          <span className="preview-avatar">AM</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-topbar">
          <div className="mobile-brand brand"><span className="brand-mark"><Scissors size={18} /></span>Navaja</div>
          <button className="theme-button" type="button" onClick={toggleTheme} aria-label={`Usar tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
        <div className="auth-card">
          <div className="segment-control" aria-label="Tipo de acceso">
            {([['login', 'Iniciar sesión'], ['registro', 'Crear cuenta']] as const).map(([key, label]) => (
              <button key={key} type="button" className={mode === key ? 'is-active' : ''} onClick={() => { setMode(key); setError('') }}>
                {mode === key && <motion.span layoutId="auth-tab" className="segment-indicator" transition={{ type: 'spring', bounce: 0, duration: 0.35 }} />}
                <span>{label}</span>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: 'spring', bounce: 0, duration: .35 }}>
              <header className="auth-heading"><h2>{copy[0]}</h2><p>{copy[1]}</p></header>
              <form onSubmit={submit} className="auth-form">
                {mode === 'registro' && <>
                  <Field label="Nombre completo" name="nombre" placeholder="Tu nombre" autoComplete="name" />
                </>}
                <Field label="Correo electrónico" name="email" type="email" placeholder="tu@correo.com" autoComplete="email" />
                {mode === 'registro' && <Field label="Teléfono" name="telefono" type="tel" placeholder="300 000 0000" autoComplete="tel" />}
                <Field label="Contraseña" name="password" type="password" placeholder="Mínimo 8 caracteres" minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                {error && <motion.div role="alert" className="form-error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{error}</motion.div>}
                <button className="primary-button" disabled={loading}>
                  <span>{loading ? 'Un momento…' : mode === 'login' ? 'Entrar' : 'Crear mi cuenta'}</span>
                  {!loading && <ArrowRight size={18} />}
                </button>
              </form>
            </motion.div>
          </AnimatePresence>
          <p className="auth-legal">El registro está disponible únicamente para clientes de la marca. Las cuentas del equipo son creadas por el propietario.</p>
        </div>
      </section>
    </main>
  )
}

function Field({ label, hint, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return <label className="field"><span>{label}</span><input required {...props} />{hint && <small>{hint}</small>}</label>
}
