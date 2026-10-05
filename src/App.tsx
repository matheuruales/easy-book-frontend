import { Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { useAuth } from './features/auth/AuthContext'
import { AuthPage } from './features/auth/AuthPage'
import { AppShell } from './components/AppShell'

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })))
const CitasPage = lazy(() => import('./pages/CitasPage').then((module) => ({ default: module.CitasPage })))
const CatalogoPage = lazy(() => import('./pages/CatalogoPage').then((module) => ({ default: module.CatalogoPage })))
const ReservaPage = lazy(() => import('./pages/ReservaPage').then((module) => ({ default: module.ReservaPage })))
const AdminPage = lazy(() => import('./pages/AdminPage').then((module) => ({ default: module.AdminPage })))

const page = (content: ReactNode) => <Suspense fallback={<div className="page-loading" aria-label="Cargando" />} >{content}</Suspense>

function ProtectedApp() {
  const { session } = useAuth()
  return session ? <AppShell /> : <Navigate to="/acceso" replace />
}

export function App() {
  const { session } = useAuth()
  return (
    <Routes>
      <Route path="/acceso" element={session ? <Navigate to="/app" replace /> : <AuthPage />} />
      <Route path="/app" element={<ProtectedApp />}>
        <Route index element={page(<DashboardPage />)} />
        <Route path="citas" element={page(<CitasPage />)} />
        <Route path="reservar" element={page(<ReservaPage />)} />
        <Route path="catalogo" element={page(<CatalogoPage />)} />
        <Route path="administracion" element={session?.rol === 'ADMINISTRADOR' ? page(<AdminPage />) : <Navigate to="/app" replace />} />
      </Route>
      <Route path="*" element={<Navigate to={session ? '/app' : '/acceso'} replace />} />
    </Routes>
  )
}
