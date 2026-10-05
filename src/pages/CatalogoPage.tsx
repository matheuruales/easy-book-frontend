import { useQuery } from '@tanstack/react-query'
import { Clock3, Scissors, UsersRound } from 'lucide-react'
import { api } from '../lib/api'
import { money } from '../lib/format'
import type { Barbero, Servicio } from '../types/api'

export function CatalogoPage() {
  const { data: barberos = [] } = useQuery({ queryKey: ['barberos'], queryFn: () => api.get<Barbero[]>('/barberos').then((r) => r.data) })
  const { data: servicios = [] } = useQuery({ queryKey: ['servicios'], queryFn: () => api.get<Servicio[]>('/servicios').then((r) => r.data) })
  return <>
    <header className="page-header"><div><span className="eyebrow">Catálogo</span><h1>Equipo y servicios.</h1><p>Una vista clara de lo que ofreces y quién lo hace posible.</p></div></header>
    <section className="catalog-section"><div className="section-heading"><div><h2><UsersRound size={20} /> Equipo</h2></div></div>
      <div className="profile-grid">{barberos.map((barbero) => <article className="profile-card surface" key={barbero.id}><span className="large-avatar">{barbero.nombre[0]}</span><div><h3>{barbero.nombre}</h3><p>{barbero.especialidad || 'Barbero profesional'}</p><small>{barbero.sedeNombre}</small></div></article>)}</div>
    </section>
    <section className="catalog-section"><div className="section-heading"><div><h2><Scissors size={20} /> Servicios</h2></div></div>
      <div className="service-grid">{servicios.map((servicio) => <article className="service-card surface" key={servicio.id}><span className="service-icon"><Scissors size={19} /></span><div><h3>{servicio.nombre}</h3><p>{servicio.descripcion || 'Servicio de barbería'}</p></div><div className="service-meta"><span><Clock3 size={14} />{servicio.duracionMinutos} min</span><strong>{money.format(servicio.precio)}</strong></div></article>)}</div>
    </section>
  </>
}
