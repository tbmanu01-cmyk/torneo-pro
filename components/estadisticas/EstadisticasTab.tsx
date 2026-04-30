export type JugadorStat = {
  id:                string;
  nombre:            string;
  numeroJugador:     number;
  equipoId:          string;
  equipoNombre:      string;
  equipoLogo:        string | null;
  goles:             number;
  asistencias:       number;
  tarjetasAmarillas: number;
  tarjetasRojas:     number;
  suspendido:        boolean;
};

interface Props {
  jugadores: JugadorStat[];
}

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

function PlayerRow({
  pos, jugador, stat, extra,
}: {
  pos:     number;
  jugador: JugadorStat;
  stat:    number;
  extra?:  React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-4 hover:bg-gray-50 transition-colors">
      <span className="w-6 text-center flex-shrink-0">
        {MEDAL[pos] ?? <span className="text-xs font-bold text-gray-400">{pos + 1}</span>}
      </span>

      <div className="h-8 w-8 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        {jugador.equipoLogo
          ? <img src={jugador.equipoLogo} alt={jugador.equipoNombre} className="h-full w-full object-cover" />
          : <span className="text-xs font-bold text-white">{jugador.equipoNombre.charAt(0)}</span>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {jugador.nombre}
          {jugador.suspendido && (
            <span className="ml-2 text-xs text-red-600 font-normal">(Suspendido)</span>
          )}
        </p>
        <p className="text-xs text-gray-500 truncate">
          #{jugador.numeroJugador} · {jugador.equipoNombre}
        </p>
      </div>

      <div className="flex-shrink-0 text-right">
        {extra ?? (
          <span className="text-lg font-bold text-gray-900">{stat}</span>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, children, empty }: {
  title:    string;
  icon:     string;
  children: React.ReactNode;
  empty:    boolean;
}) {
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      {empty
        ? (
          <div className="py-10 text-center text-gray-400 text-sm">
            Sin datos aún — se actualizará al registrar resultados
          </div>
        )
        : <div className="divide-y divide-gray-50">{children}</div>
      }
    </div>
  );
}

export default function EstadisticasTab({ jugadores }: Props) {
  const TOP = 10;

  const goleadores   = [...jugadores].sort((a, b) => b.goles        - a.goles).slice(0, TOP);
  const asistentes   = [...jugadores].sort((a, b) => b.asistencias  - a.asistencias).slice(0, TOP);
  const disciplina   = [...jugadores]
    .filter((j) => j.tarjetasAmarillas > 0 || j.tarjetasRojas > 0 || j.suspendido)
    .sort((a, b) => (b.tarjetasRojas * 3 + b.tarjetasAmarillas) - (a.tarjetasRojas * 3 + a.tarjetasAmarillas))
    .slice(0, TOP);

  const sinGoles      = goleadores.every((j)  => j.goles === 0);
  const sinAsistencias = asistentes.every((j) => j.asistencias === 0);
  const sinTarjetas   = disciplina.length === 0;

  // Resumen por equipo
  type EquipoResumen = { nombre: string; logo: string | null; goles: number; jugadores: number };
  const equipoMap = new Map<string, EquipoResumen>();
  for (const j of jugadores) {
    const prev = equipoMap.get(j.equipoId) ?? { nombre: j.equipoNombre, logo: j.equipoLogo, goles: 0, jugadores: 0 };
    equipoMap.set(j.equipoId, { ...prev, goles: prev.goles + j.goles, jugadores: prev.jugadores + 1 });
  }
  const equipoResumen = Array.from(equipoMap.values()).sort((a, b) => b.goles - a.goles);
  const sinResumen    = equipoResumen.every((e) => e.goles === 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

      {/* Goleadores */}
      <Section title="Tabla de Goleadores" icon="⚽" empty={sinGoles}>
        {goleadores.filter((j) => j.goles > 0).map((j, i) => (
          <PlayerRow key={j.id} pos={i} jugador={j} stat={j.goles}
            extra={
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">{j.goles}</span>
                <span className="text-xs text-gray-400">gol{j.goles !== 1 ? "es" : ""}</span>
              </div>
            }
          />
        ))}
      </Section>

      {/* Asistentes */}
      <Section title="Tabla de Asistencias" icon="🅰️" empty={sinAsistencias}>
        {asistentes.filter((j) => j.asistencias > 0).map((j, i) => (
          <PlayerRow key={j.id} pos={i} jugador={j} stat={j.asistencias}
            extra={
              <div className="flex items-center gap-1">
                <span className="text-lg font-bold text-gray-900">{j.asistencias}</span>
                <span className="text-xs text-gray-400">asist.</span>
              </div>
            }
          />
        ))}
      </Section>

      {/* Disciplina */}
      <Section title="Tabla Disciplinaria" icon="🟨" empty={sinTarjetas}>
        {disciplina.map((j, i) => (
          <PlayerRow key={j.id} pos={i} jugador={j} stat={0}
            extra={
              <div className="flex items-center gap-1.5">
                {j.tarjetasAmarillas > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-amber-700 bg-amber-100 rounded px-1.5 py-0.5">
                    🟨 {j.tarjetasAmarillas}
                  </span>
                )}
                {j.tarjetasRojas > 0 && (
                  <span className="flex items-center gap-0.5 text-xs font-bold text-red-700 bg-red-100 rounded px-1.5 py-0.5">
                    🟥 {j.tarjetasRojas}
                  </span>
                )}
                {j.suspendido && (
                  <span className="text-xs text-red-600 font-semibold">⛔</span>
                )}
              </div>
            }
          />
        ))}
      </Section>

      {/* Goles por equipo */}
      <Section title="Goles por Equipo" icon="👕" empty={sinResumen}>
        {equipoResumen.filter((e) => e.goles > 0).map((equipo, i) => (
          <div key={equipo.nombre} className="flex items-center gap-3 py-2.5 px-4 hover:bg-gray-50 transition-colors">
            <span className="w-6 text-center flex-shrink-0">
              {MEDAL[i] ?? <span className="text-xs font-bold text-gray-400">{i + 1}</span>}
            </span>
            <div className="h-8 w-8 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              {equipo.logo
                ? <img src={equipo.logo} alt={equipo.nombre} className="h-full w-full object-cover" />
                : <span className="text-xs font-bold text-white">{equipo.nombre.charAt(0)}</span>
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{equipo.nombre}</p>
              <p className="text-xs text-gray-500">{equipo.jugadores} jugadores</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-gray-900">{equipo.goles}</span>
              <span className="text-xs text-gray-400">goles</span>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}
