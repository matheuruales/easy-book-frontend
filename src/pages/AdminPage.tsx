import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'motion/react'
import { Clock3, MapPin, Plus, Scissors, Store, UsersRound, X } from 'lucide-react'
import { api, getApiError } from '../lib/api'
import { money } from '../lib/format'
import { useAuth } from '../features/auth/AuthContext'
import type { Barbero, Sede, Servicio } from '../types/api'

type Panel = 'sede' | 'barbero' | 'servicio' | 'horario' | null

const days: Record<string, string> = {
  MONDAY: 'Lunes', TUESDAY: 'Martes', WEDNESDAY: 'Miércoles', THURSDAY: 'Jueves',
  FRIDAY: 'Viernes', SATURDAY: 'Sábado', SUNDAY: 'Domingo',
}

export function AdminPage() {
  const [panel, setPanel] = useState<Panel>(null)
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const sedes = useQuery({ queryKey: ['sedes'], queryFn: () => api.get<Sede[]>('/sedes').then((r) => r.data) })
  const barberos = useQuery({ queryKey: ['barberos'], queryFn: () => api.get<Barbero[]>('/barberos').then((r) => r.data) })
  const servicios = useQuery({ queryKey: ['servicios'], queryFn: () => api.get<Servicio[]>('/servicios').then((r) => r.data) })

  const create = useMutation({
    mutationFn: async ({ type, values }: { type: Exclude<Panel, null>; values: Record<string, string> }) => {
      if (type === 'sede') return api.post('/sedes', { ...values, zonaHoraria: values.zonaHoraria || 'America/Bogota' })
      if (type === 'barbero') return api.post('/barberos', { ...values, comisionPorcentaje: Number(values.comisionPorcentaje) })
      if (type === 'servicio') return api.post('/servicios', {
        ...values,
        duracionMinutos: Number(values.duracionMinutos),
        precio: Number(values.precio),
        valorComision: Number(values.valorComision),
      })
      return api.post('/horarios', values)
    },
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: [variables.type === 'sede' ? 'sedes' : variables.type === 'servicio' ? 'servicios' : variables.type === 'horario' ? 'horarios' : 'barberos'] })
      setPanel(null)
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!panel) return
    create.mutate({ type: panel, values: Object.fromEntries(new FormData(event.currentTarget)) as Record<string, string> })
  }

  return <>
    <header className="page-header admin-header">
      <div><span className="eyebrow">Administración general</span><h1>Toda la marca, bajo control.</h1><p>Gestiona cada sede, tu equipo, los servicios y los horarios desde un solo lugar.</p></div>
      <button className="primary-button compact" onClick={() => setPanel('barbero')}><Plus size={17} /> Registrar barbero</button>
    </header>

    <section className="business-hero surface">
      <div className="business-icon"><Store size={25} /></div>
      <div><span className="eyebrow">Marca principal</span><h2>{session?.marcaNombre || 'Tu marca'}</h2><p>Una sola marca administrada por {session?.nombre}, con todos sus puntos de atención.</p></div>
      <div className="business-metrics">
        <span><strong>{sedes.data?.length ?? 0}</strong><small>Sedes</small></span>
        <span><strong>{barberos.data?.filter((item) => item.activo).length ?? 0}</strong><small>Barberos</small></span>
        <span><strong>{servicios.data?.filter((item) => item.activo).length ?? 0}</strong><small>Servicios</small></span>
      </div>
    </section>

    <section className="admin-grid">
      <ManagementCard icon={<MapPin size={20} />} title="Puntos de atención" description="Todas las sedes físicas de la marca." action="Agregar sede" onAdd={() => setPanel('sede')}>
        {sedes.data?.length ? sedes.data.map((sede) => <EntityRow key={sede.id} title={sede.nombre} subtitle={sede.direccion} meta={sede.telefono || 'Sin teléfono'} />) : <Empty text="Aún no has agregado sedes." />}
      </ManagementCard>
      <ManagementCard icon={<UsersRound size={20} />} title="Barberos" description="Cuentas y comisiones de tu equipo." action="Registrar barbero" onAdd={() => setPanel('barbero')}>
        {barberos.data?.length ? barberos.data.map((barbero) => <EntityRow key={barbero.id} title={barbero.nombre} subtitle={`${barbero.especialidad || 'Barbero'} · ${barbero.sedeNombre}`} meta={`${barbero.comisionPorcentaje}%`} avatar={barbero.nombre[0]} />) : <Empty text="Tu equipo aparecerá aquí." />}
      </ManagementCard>
      <ManagementCard icon={<Scissors size={20} />} title="Servicios" description="Duración, precio y comisión." action="Crear servicio" onAdd={() => setPanel('servicio')}>
        {servicios.data?.length ? servicios.data.map((servicio) => <EntityRow key={servicio.id} title={servicio.nombre} subtitle={`${servicio.duracionMinutos} min · ${servicio.descripcion || 'Sin descripción'}`} meta={money.format(servicio.precio)} />) : <Empty text="Crea el primer servicio de tu catálogo." />}
      </ManagementCard>
      <ManagementCard icon={<Clock3 size={20} />} title="Horarios" description="Define cuándo está disponible cada barbero." action="Agregar horario" onAdd={() => setPanel('horario')}>
        <div className="schedule-summary"><Clock3 size={22} /><div><strong>Disponibilidad por profesional</strong><span>Asigna días y rangos de atención sin cruces.</span></div></div>
      </ManagementCard>
    </section>

    <AnimatePresence>
      {panel && <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={() => setPanel(null)}>
        <motion.aside className="admin-sheet" role="dialog" aria-modal="true" aria-label={panelTitle(panel)} initial={{ x: '100%', opacity: .7 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: .7 }} transition={{ type: 'spring', bounce: 0, duration: .4 }} onMouseDown={(event) => event.stopPropagation()}>
          <header className="sheet-header"><div><span className="eyebrow">Nuevo registro</span><h2>{panelTitle(panel)}</h2></div><button className="icon-button" onClick={() => setPanel(null)} aria-label="Cerrar"><X size={20} /></button></header>
          <form className="admin-form" onSubmit={submit}>
            {panel === 'sede' && <SedeForm />}
            {panel === 'barbero' && <BarberoForm sedes={sedes.data ?? []} />}
            {panel === 'servicio' && <ServicioForm />}
            {panel === 'horario' && <HorarioForm barberos={barberos.data ?? []} />}
            {create.error && <div className="form-error">{getApiError(create.error)}</div>}
            <div className="sheet-actions"><button type="button" className="secondary-button" onClick={() => setPanel(null)}>Cancelar</button><button className="primary-button compact" disabled={create.isPending}>{create.isPending ? 'Guardando…' : 'Guardar'}</button></div>
          </form>
        </motion.aside>
      </motion.div>}
    </AnimatePresence>
  </>
}

function panelTitle(panel: Exclude<Panel, null>) {
  return { sede: 'Agregar sede', barbero: 'Registrar barbero', servicio: 'Crear servicio', horario: 'Agregar horario' }[panel]
}

function ManagementCard({ icon, title, description, action, onAdd, children }: { icon: ReactNode; title: string; description: string; action: string; onAdd: () => void; children: ReactNode }) {
  return <article className="management-card surface"><header><span className="management-icon">{icon}</span><div><h2>{title}</h2><p>{description}</p></div><button className="add-button" onClick={onAdd}><Plus size={16} />{action}</button></header><div className="entity-list">{children}</div></article>
}

function EntityRow({ title, subtitle, meta, avatar }: { title: string; subtitle: string; meta: string; avatar?: string }) {
  return <div className="entity-row">{avatar && <span className="entity-avatar">{avatar}</span>}<div><strong>{title}</strong><span>{subtitle}</span></div><small>{meta}</small></div>
}

function Empty({ text }: { text: string }) { return <div className="admin-empty">{text}</div> }

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="field"><span>{label}</span><input required {...props} /></label>
}

function Select({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return <label className="field"><span>{label}</span><select required {...props}>{children}</select></label>
}

function SedeForm() { return <><Input label="Nombre de la sede" name="nombre" placeholder="Sede Centro" /><Input label="Dirección" name="direccion" placeholder="Calle 10 # 20-30" /><Input label="Teléfono" name="telefono" placeholder="607 000 0000" /><Input label="Zona horaria" name="zonaHoraria" defaultValue="America/Bogota" /></> }

function BarberoForm({ sedes }: { sedes: Sede[] }) { return <><Input label="Nombre completo" name="nombre" placeholder="Nombre del barbero" /><Input label="Correo" name="email" type="email" placeholder="barbero@correo.com" /><Input label="Contraseña temporal" name="password" type="password" minLength={8} placeholder="Mínimo 8 caracteres" /><Select label="Sede" name="sedeId"><option value="">Selecciona una sede</option>{sedes.map((sede) => <option key={sede.id} value={sede.id}>{sede.nombre}</option>)}</Select><Input label="Especialidad" name="especialidad" placeholder="Corte clásico y barba" /><Input label="Comisión (%)" name="comisionPorcentaje" type="number" min="0" max="100" step="0.01" defaultValue="40" /></> }

function ServicioForm() { return <><Input label="Nombre" name="nombre" placeholder="Corte premium" /><Input label="Descripción" name="descripcion" placeholder="Corte, lavado y acabado" /><div className="form-columns"><Input label="Duración (min)" name="duracionMinutos" type="number" min="5" max="480" defaultValue="45" /><Input label="Precio" name="precio" type="number" min="0" step="100" placeholder="35000" /></div><Select label="Tipo de comisión" name="tipoComision" defaultValue="PORCENTAJE"><option value="PORCENTAJE">Porcentaje</option><option value="VALOR_FIJO">Valor fijo</option></Select><Input label="Valor de comisión" name="valorComision" type="number" min="0" step="0.01" defaultValue="40" /></> }

function HorarioForm({ barberos }: { barberos: Barbero[] }) { return <><Select label="Barbero" name="barberoId"><option value="">Selecciona un barbero</option>{barberos.map((barbero) => <option key={barbero.id} value={barbero.id}>{barbero.nombre}</option>)}</Select><Select label="Día" name="diaSemana"><option value="">Selecciona un día</option>{Object.entries(days).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><div className="form-columns"><Input label="Desde" name="horaInicio" type="time" defaultValue="09:00" /><Input label="Hasta" name="horaFin" type="time" defaultValue="18:00" /></div></> }
