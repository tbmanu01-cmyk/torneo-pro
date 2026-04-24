export type Role          = "SUPER_ADMIN" | "ADMIN_TORNEO" | "ASISTENTE" | "CAPITAN" | "ESPECTADOR"
export type FormatoTorneo = "LIGA" | "ELIMINACION_DIRECTA" | "IDA_VUELTA"
export type EstadoTorneo  = "PENDIENTE" | "EN_CURSO" | "FINALIZADO"
export type EstadoPago    = "PENDIENTE" | "PAGADO" | "BLOQUEADO"

export type UserRow = {
  id:        string
  email:     string
  name:      string
  role:      Role
  createdAt: Date
}

export type TorneoRow = {
  id:              string
  nombre:          string
  descripcion:     string | null
  logo:            string | null
  formato:         FormatoTorneo
  estado:          EstadoTorneo
  puntosVictoria:  number
  puntosEmpate:    number
  puntosDerrota:   number
  edicion:         number
  fechaInicio:     Date | null
  fechaFin:        Date | null
  adminId:         string
  admin:           { name: string }
  _count:          { equipos: number }
  createdAt:       Date
}

export type EquipoRow = {
  id:         string
  nombre:     string
  logo:       string | null
  torneoId:   string
  capitanId:  string | null
  estadoPago: EstadoPago
  capitan:    { id: string; name: string } | null
  _count:     { jugadores: number }
  createdAt:  Date
}

export type JugadorRow = {
  id:                string
  nombre:            string
  numeroJugador:     number
  equipoId:          string
  tarjetasAmarillas: number
  tarjetasRojas:     number
  suspendido:        boolean
  goles:             number
  asistencias:       number
  createdAt:         Date
}
