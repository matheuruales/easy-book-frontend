import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2, CalendarDays, LayoutGrid, LogOut, Moon, Scissors, Sparkles, Sun, UsersRound } from 'lucide-react'
import { useAuth } from '../features/auth/AuthContext'
import { useTheme } from '../features/theme/ThemeContext'

const roleLabel = { ADMINISTRADOR: 'Administrador', BARBERO: 'Barbero', CLIENTE: 'Cliente' }

export function AppShell() {
  const { session, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [location.pathname])

  if (!session) return null

  const items = session.rol === 'CLIENTE'
    ? [
        { to: '/app', label: 'Inicio', icon: LayoutGrid, end: true },
        { to: '/app/reservar', label: 'Reservar', icon: Sparkles },
        { to: '/app/citas', label: 'Mis citas', icon: CalendarDays },
      ]
    : [
        { to: '/app', label: 'Resumen', icon: LayoutGrid, end: true },
        { to: '/app/citas', label: session.rol === 'BARBERO' ? 'Mi agenda' : 'Agenda', icon: CalendarDays },
        { to: '/app/catalogo', label: session.rol === 'BARBERO' ? 'Servicios' : 'Equipo y servicios', icon: UsersRound },
        ...(session.rol === 'ADMINISTRADOR' ? [{ to: '/app/administracion', label: 'Administración', icon: Building2 }] : []),
      ]

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark"><Scissors size={18} /></span><span>Navaja<small>Barbershop</small></span></div>
        <nav className="side-nav">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'nav-item is-active' : 'nav-item'}>
              <Icon size={19} strokeWidth={1.8} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="user-card">
          <span className="avatar">{session.nombre.slice(0, 1).toUpperCase()}</span>
          <span className="user-copy"><strong>{session.nombre}</strong><small>{roleLabel[session.rol]}</small></span>
          <button className="icon-button" onClick={toggleTheme} aria-label={`Usar tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>{theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}</button>
          <button className="icon-button" onClick={logout} aria-label="Cerrar sesión"><LogOut size={17} /></button>
        </div>
      </aside>

      <header className="mobile-header">
        <div className="brand"><span className="brand-mark"><Scissors size={17} /></span><span>Navaja<small>Barbershop</small></span></div>
        <div>
          <button className="icon-button" onClick={toggleTheme} aria-label={`Usar tema ${theme === 'light' ? 'oscuro' : 'claro'}`}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
          <button className="icon-button" onClick={logout} aria-label="Cerrar sesión"><LogOut size={18} /></button>
        </div>
      </header>

      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} className="page-container" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <nav className="mobile-nav">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'mobile-nav-item is-active' : 'mobile-nav-item'}>
            <Icon size={20} /><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
