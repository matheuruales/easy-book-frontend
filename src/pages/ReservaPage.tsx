import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, ChevronRight, Clock3, MapPin, Scissors, UserRound } from 'lucide-react'
import { useState } from 'react'
import { api } from '../lib/api'
import { money } from '../lib/format'
import type { Barbero, Perfil, Sede, Servicio } from '../types/api'
import { getApiError } from '../lib/api'

export function ReservaPage() {
  const [sedeId, setSedeId] = useState('')
  const [servicioId, setServicioId] = useState('')
  const [barberoId, setBarberoId] = useState('')
  const [fecha, setFecha] = useState('')
  const [inicio, setInicio] = useState('')
  const [success, setSuccess] = useState(false)
  const queryClient = useQueryClient()
  const { data: sedes = [] } = useQuery({ queryKey: ['sedes'], queryFn: () => api.get<Sede[]>('/sedes').then((r) => r.data) })
  const { data: servicios = [] } = useQuery({ queryKey: ['servicios'], queryFn: () => api.get<Servicio[]>('/servicios').then((r) => r.data) })
  const { data: barberos = [] } = useQuery({ queryKey: ['barberos'], queryFn: () => api.get<Barbero[]>('/barberos').then((r) => r.data) })
  const { data: perfil } = useQuery({ queryKey: ['perfil'], queryFn: () => api.get<Perfil>('/perfil').then((r) => r.data) })
  const { data: franjas = [] } = useQuery({
    queryKey: ['disponibilidad', barberoId, servicioId, fecha],
    queryFn: () => api.get<{ inicio: string; fin: string }[]>('/disponibilidad', { params: { barberoId, servicioId, fecha } }).then((r) => r.data),
    enabled: Boolean(barberoId && servicioId && fecha),
  })
  const availableBarbers = barberos.filter((b) => !sedeId || b.sedeId === sedeId)
  const reservar = useMutation({
    mutationFn: () => api.post('/citas', { sedeId, barberoId, clienteId: perfil?.perfilId, servicioId, inicio, notas: '' }),
    onSuccess: async () => {
      setSuccess(true)
      setInicio('')
      await queryClient.invalidateQueries({ queryKey: ['citas'] })
    },
  })

  return <>
    <header className="page-header"><div><span className="eyebrow">Nueva reserva</span><h1>Elige tu momento.</h1><p>Cuatro pasos sencillos. Sin llamadas, sin esperas.</p></div></header>
    <section className="booking-layout">
      <div className="booking-steps surface">
        <BookingSelect icon={MapPin} number="1" title="¿Dónde?" value={sedeId} onChange={(value) => { setSedeId(value); setBarberoId('') }}>
          <option value="">Selecciona una sede</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre} — {s.direccion}</option>)}
        </BookingSelect>
        <BookingSelect icon={Scissors} number="2" title="¿Qué servicio?" value={servicioId} onChange={setServicioId}>
          <option value="">Selecciona un servicio</option>{servicios.map((s) => <option key={s.id} value={s.id}>{s.nombre} · {money.format(s.precio)} · {s.duracionMinutos} min</option>)}
        </BookingSelect>
        <BookingSelect icon={UserRound} number="3" title="¿Con quién?" value={barberoId} onChange={setBarberoId}>
          <option value="">Selecciona un barbero</option>{availableBarbers.map((b) => <option key={b.id} value={b.id}>{b.nombre}</option>)}
        </BookingSelect>
        <label className="booking-step"><span className="step-number">4</span><span className="step-icon"><CalendarDays size={19} /></span><span className="step-copy"><strong>¿Qué día?</strong><small>Consulta la disponibilidad real.</small><input type="date" min={new Date().toISOString().slice(0, 10)} value={fecha} onChange={(e) => setFecha(e.target.value)} /></span></label>
      </div>
      <aside className="availability-panel surface">
        <div className="section-heading"><div><span className="eyebrow">Disponibilidad</span><h2>Horas libres</h2></div><Clock3 size={20} /></div>
        {success && <div className="booking-success"><Check size={18} /><span><strong>Reserva creada</strong><small>Ya aparece en tus citas.</small></span></div>}
        {!barberoId || !servicioId || !fecha ? <div className="empty-state compact-empty"><p>Completa los pasos para ver las horas disponibles.</p></div> : franjas.length ? <>
          <div className="time-grid">{franjas.map((franja) => <button className={inicio === franja.inicio ? 'is-selected' : ''} onClick={() => { setInicio(franja.inicio); setSuccess(false) }} key={franja.inicio}>{new Date(franja.inicio).toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' })}{inicio === franja.inicio ? <Check size={15} /> : <ChevronRight size={15} />}</button>)}</div>
          {reservar.error && <div className="form-error booking-error">{getApiError(reservar.error)}</div>}
          <button className="primary-button booking-submit" disabled={!inicio || !perfil?.perfilId || reservar.isPending} onClick={() => reservar.mutate()}>{reservar.isPending ? 'Reservando…' : 'Confirmar reserva'}</button>
        </> : <div className="empty-state compact-empty"><p>No hay horas disponibles para este día.</p></div>}
      </aside>
    </section>
  </>
}

function BookingSelect({ icon: Icon, number, title, value, onChange, children }: { icon: typeof MapPin; number: string; title: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="booking-step"><span className="step-number">{number}</span><span className="step-icon"><Icon size={19} /></span><span className="step-copy"><strong>{title}</strong><select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select></span></label>
}
