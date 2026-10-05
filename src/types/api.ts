export type RolUsuario = 'ADMINISTRADOR' | 'BARBERO' | 'CLIENTE'

export interface AuthResponse {
  token: string
  tipo: string
  expiraEnSegundos: number
  usuarioId: string
  barberiaId: string
  marcaNombre: string
  nombre: string
  rol: RolUsuario
}

export interface Perfil {
  usuarioId: string
  barberiaId: string
  marcaNombre: string
  perfilId: string | null
  nombre: string
  email: string
  rol: RolUsuario
}

export interface Cita {
  id: string
  sedeId: string
  sedeNombre: string
  barberoId: string
  barberoNombre: string
  clienteId: string
  clienteNombre: string
  servicioId: string
  servicioNombre: string
  inicio: string
  fin: string
  estado: 'PENDIENTE' | 'CONFIRMADA' | 'COMPLETADA' | 'CANCELADA' | 'NO_ASISTIO'
  precioPactado: number
  comisionPactada: number
  notas?: string
}

export interface Sede {
  id: string
  nombre: string
  direccion: string
  telefono?: string
  zonaHoraria: string
  activa: boolean
}

export interface Barbero {
  id: string
  nombre: string
  email: string
  sedeId: string
  sedeNombre: string
  especialidad?: string
  comisionPorcentaje: number
  activo: boolean
}

export interface Servicio {
  id: string
  nombre: string
  descripcion?: string
  duracionMinutos: number
  precio: number
  tipoComision: 'PORCENTAJE' | 'VALOR_FIJO'
  valorComision: number
  activo: boolean
}

export interface Horario {
  id: string
  barberoId: string
  diaSemana: string
  horaInicio: string
  horaFin: string
  activo: boolean
}
