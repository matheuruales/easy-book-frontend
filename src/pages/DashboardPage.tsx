import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, CalendarCheck, Clock3, Scissors, TrendingUp, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { api } from '../lib/api'
import { money, shortDate, time } from '../lib/format'
import { useAuth } from '../features/auth/AuthContext'
import type { Barbero, Cita, Servicio } from '../types/api'

export function DashboardPage() {
  const { session } = useAuth()
  const { data: citas = [], isLoading } = useQuery({
    queryKey: ['citas'],
    queryFn: () => api.get<Cita[]>('/citas').then((response) => response.data),
  })
  const { data: barberos = [] } = useQuery({
    queryKey: ['barberos'],
    queryFn: () => api.get<Barbero[]>('/barberos').then((response) => response.data),
  })
  const { data: servicios = [] } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => api.get<Servicio[]>('/servicios').then((response) => response.data),
  })

  const now = new Date()
  const upcoming = citas
    .filter((cita) => new Date(cita.inicio) >= now && !['CANCELADA', 'NO_ASISTIO'].includes(cita.estado))
    .sort((a, b) => a.inicio.localeCompare(b.inicio))
  const todayKey = now.toISOString().slice(0, 10)
  const today = citas.filter((cita) => cita.inicio.startsWith(todayKey) && cita.estado !== 'CANCELADA')
  const completed = citas.filter((cita) => cita.estado === 'COMPLETADA')
  const ingresos = completed.reduce((total, cita) => total + Number(cita.precioPactado), 0)

  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 18 ? 'Buenas tardes' : 'Buenas noches'
  const isClient = session?.rol === 'CLIENTE'

  return (
    <>
      <header className="dashboard-hero">
        <img src="/images/navaja-interior.webp" alt="Interior de una sede Navaja preparado para recibir clientes" />
        <div className="dashboard-hero-shade" />
        <div className="dashboard-hero-copy">
          <span className="eyebrow eyebrow--light">{isClient ? session?.marcaNombre : 'Una marca · Todas sus sedes'}</span>
          <h1>{greeting},<br />{session?.nombre.split(' ')[0]}.</h1>
          <p>{isClient ? 'Tu próximo buen corte empieza aquí.' : 'La operación de Navaja, clara de un vistazo.'}</p>
        </div>
        {isClient && <Link className="primary-button compact hero-action" to="/app/reservar">Reservar ahora <ArrowUpRight size={17} /></Link>}
      </header>

      <section className="stats-grid" aria-label="Indicadores">
        <StatCard icon={CalendarCheck} label={isClient ? 'Próxima cita' : 'Citas hoy'} value={isClient ? String(upcoming.length) : String(today.length)} tone="sage" />
        <StatCard icon={Clock3} label="Pendientes" value={String(citas.filter((c) => c.estado === 'PENDIENTE').length)} tone="sand" />
        {!isClient && <>
          <StatCard icon={TrendingUp} label="Ingresos registrados" value={money.format(ingresos)} tone="ink" />
          <StatCard icon={UsersRound} label="Equipo activo" value={String(barberos.filter((b) => b.activo).length)} tone="clay" />
        </>}
        {isClient && <StatCard icon={Scissors} label="Servicios disponibles" value={String(servicios.filter((s) => s.activo).length)} tone="clay" />}
      </section>

      <section className="content-grid">
        <article className="surface schedule-card">
          <div className="section-heading">
            <div><span className="eyebrow">En agenda</span><h2>{isClient ? 'Tus próximas visitas' : 'Lo que viene'}</h2></div>
            <Link to="/app/citas" className="text-link">Ver agenda <ArrowUpRight size={15} /></Link>
          </div>
          {isLoading ? <SkeletonRows /> : upcoming.length ? (
            <div className="appointment-list">
              {upcoming.slice(0, 4).map((cita, index) => <AppointmentRow key={cita.id} cita={cita} index={index} />)}
            </div>
          ) : <EmptySchedule isClient={isClient} />}
        </article>

        <article className="surface quiet-card">
          <img src="/images/navaja-craft.webp" alt="Detalle del trabajo preciso de un barbero Navaja" />
          <div className="quiet-card-shade" />
          <div className="quiet-card-copy">
            <span className="eyebrow eyebrow--light">El oficio, primero</span>
            <h2>{today.length ? `${today.length} oportunidades para hacer un gran trabajo.` : 'Cada detalle cuenta.'}</h2>
            <div className="progress-track"><motion.span initial={{ width: 0 }} animate={{ width: `${Math.min(100, today.length * 18)}%` }} transition={{ type: 'spring', bounce: 0, duration: 0.6 }} /></div>
            <p>{completed.length} servicios completados en el historial.</p>
          </div>
        </article>
      </section>
    </>
  )
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof CalendarCheck; label: string; value: string; tone: string }) {
  return <article className={`stat-card tone-${tone}`}><span className="stat-icon"><Icon size={19} /></span><span className="stat-label">{label}</span><strong>{value}</strong></article>
}

function AppointmentRow({ cita, index }: { cita: Cita; index: number }) {
  const start = new Date(cita.inicio)
  return (
    <motion.div className="appointment-row" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
      <div className="date-tile"><strong>{start.getDate()}</strong><span>{shortDate.format(start).split(' ')[0]}</span></div>
      <div className="appointment-copy"><strong>{cita.servicioNombre}</strong><span>{cita.clienteNombre} · {cita.barberoNombre}</span></div>
      <div className="appointment-time"><strong>{time.format(start)}</strong><span className={`status status-${cita.estado.toLowerCase()}`}>{cita.estado.toLowerCase()}</span></div>
    </motion.div>
  )
}

function EmptySchedule({ isClient }: { isClient: boolean }) {
  return <div className="empty-state"><span className="empty-icon"><CalendarCheck /></span><h3>La agenda está despejada</h3><p>{isClient ? 'Cuando reserves, tu próxima cita aparecerá aquí.' : 'Las próximas citas aparecerán aquí.'}</p></div>
}

function SkeletonRows() {
  return <div className="skeleton-list">{[1, 2, 3].map((item) => <div className="skeleton-row" key={item} />)}</div>
}
