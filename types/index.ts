export type Role          = "SUPER_ADMIN" | "ADMIN_TORNEO" | "ASISTENTE" | "CAPITAN" | "ESPECTADOR"
export type FormatoTorneo = "LIGA" | "ELIMINACION_DIRECTA" | "IDA_VUELTA"
export type EstadoTorneo  = "PENDIENTE" | "EN_CURSO" | "FINALIZADO"
export type EstadoPago    = "PENDIENTE" | "PARCIAL" | "PAGADO" | "BLOQUEADO"
export type EstadoJornada = "PENDIENTE" | "EN_CURSO" | "FINALIZADA"
export type EstadoPartido = "PENDIENTE" | "EN_CURSO" | "FINALIZADO" | "SUSPENDIDO"

export type UserRow = {
  id:        string
  email:     string
  name:      string
  role:      Role
  createdAt: Date
}

export type ClubRow = {
  id:        string
  nombre:    string
  logo:      string | null
  ciudad:    string | null
  capitanId: string | null
  capitan:   { id: string; name: string; email: string } | null
  _count:    { equipos: number }
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
  clubId:     string | null
  capitanId:  string | null
  estadoPago: EstadoPago
  capitan:    { id: string; name: string } | null
  club:       { id: string; nombre: string } | null
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

export type EquipoBasic = {
  id:     string
  nombre: string
  logo:   string | null
}

export type PartidoRow = {
  id:                string
  jornadaId:         string
  equipoLocalId:     string | null
  equipoVisitanteId: string | null
  golesLocal:        number
  golesVisitante:    number
  fecha:             Date | null
  hora:              string | null
  cancha:            string | null
  estado:            EstadoPartido
  actaCerrada:       boolean
  equipoLocal:       EquipoBasic | null
  equipoVisitante:   EquipoBasic | null
  createdAt:         Date
}

export type JornadaRow = {
  id:        string
  numero:    number
  torneoId:  string
  nombre:    string
  fecha:     Date | null
  estado:    EstadoJornada
  partidos:  PartidoRow[]
  createdAt: Date
}

export type DatosPagoMovil = {
  banco:    string;
  telefono: string;
  cedula:   string;
  titular:  string;
};

export type ConfiguracionPagoRow = {
  id:                      string;
  torneoId:                string;
  montoInscripcion:        number;
  moneda:                  string;
  permiteCuotas:           boolean;
  numeroCuotas:            number | null;
  montoPrimeraCuota:       number | null;
  montoSegundaCuota:       number | null;
  fechaLimitePrimeraCuota: Date | null;
  fechaLimiteSegundaCuota: Date | null;
  datosPagoMovil:          DatosPagoMovil;
  instrucciones:           string | null;
  createdAt:               Date;
};

export type PagoRow = {
  id:               string;
  equipoId:         string;
  torneoId:         string;
  monto:            number;
  numeroCuota:      number;
  numeroReferencia: string | null;
  comprobante:      string;
  estado:           "PENDIENTE" | "APROBADO" | "RECHAZADO";
  motivoRechazo:    string | null;
  aprobadoPorId:    string | null;
  fechaAprobacion:  Date | null;
  createdAt:        Date;
  equipo?:          { id: string; nombre: string; logo: string | null };
  aprobadoPor?:     { name: string } | null;
};
