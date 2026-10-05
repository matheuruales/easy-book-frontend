import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Check, CircleX, MoreHorizontal } from 'lucide-react'
import { api, getApiError } from '../lib/api'
import { money, shortDate, time } from '../lib/format'
import { useAuth } from '../features/auth/AuthContext'
import type { Cita } from '../types/api'

export function CitasPage() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  const { data: citas = [], isLoading, error } = useQuery({
    queryKey: ['citas'],
    queryFn: () => api.get<Cita[]>('/citas').then((response) => response.data),
  })
  const action = useMutation({
    mutationFn: ({ id, state }: { id: string; state: string }) => api.patch(`/citas/${id}/${state}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['citas'] }),
  })

  return (
    <>
      <header className="page-header">
        <div><span className="eyebrow">Agenda</span><h1>{session?.rol === 'CLIENTE' ? 'Mis citas' : 'Cada cita, en su lugar.'}</h1><p>Consulta y actualiza el estado de cada servicio.</p></div>
      </header>
      <section className="surface table-surface">
        {error && <div className="inline-message error">{getApiError(error)}</div>}
        {isLoading ? <SkeletonRows /> : citas.length ? (
          <div className="appointments-table">
            {citas.map((cita) => {
              const date = new Date(cita.inicio)
              return <article className="table-row" key={cita.id}>
                <div className="table-date"><span>{shortDate.format(date)}</span><strong>{time.format(date)}</strong></div>
                <div className="table-main"><strong>{cita.servicioNombre}</strong><span>{cita.clienteNombre} · con {cita.barberoNombre}</span></div>
                <span className={`status status-${cita.estado.toLowerCase()}`}>{cita.estado.replace('_', ' ').toLowerCase()}</span>
                <strong className="table-price">{money.format(cita.precioPactado)}</strong>
                <div className="row-actions">
                  {session?.rol !== 'CLIENTE' && cita.estado === 'PENDIENTE' && <button title="Confirmar" onClick={() => action.mutate({ id: cita.id, state: 'confirmar' })}><Check size={17} /></button>}
                  {session?.rol !== 'CLIENTE' && ['PENDIENTE', 'CONFIRMADA'].includes(cita.estado) && <button title="Completar" onClick={() => action.mutate({ id: cita.id, state: 'completar' })}><CalendarDays size={17} /></button>}
                  {!['COMPLETADA', 'CANCELADA'].includes(cita.estado) && <button title="Cancelar" onClick={() => action.mutate({ id: cita.id, state: 'cancelar' })}><CircleX size={17} /></button>}
                  <button title="Más opciones"><MoreHorizontal size={17} /></button>
                </div>
              </article>
            })}
          </div>
        ) : <div className="empty-state"><span className="empty-icon"><CalendarDays /></span><h3>Aún no hay citas</h3><p>Tu agenda comenzará a tomar forma aquí.</p></div>}
      </section>
    </>
  )
}

function SkeletonRows() { return <div className="skeleton-list">{[1, 2, 3, 4].map((item) => <div className="skeleton-row" key={item} />)}</div> }
