import type { FormatoTorneo } from "@/types";

export type StandingRow = {
  equipoId: string;
  nombre:   string;
  logo:     string | null;
  PJ: number;
  PG: number;
  PE: number;
  PP: number;
  GF: number;
  GC: number;
  DG: number;
  Pts: number;
};

interface Props {
  standings:  StandingRow[];
  formato:    FormatoTorneo;
  puntosVictoria: number;
  puntosEmpate:   number;
  puntosDerrota:  number;
}

const MEDAL: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

export default function TablaTab({ standings, formato, puntosVictoria, puntosEmpate, puntosDerrota }: Props) {
  const hayPartidos = standings.some((s) => s.PJ > 0);

  if (formato === "ELIMINACION_DIRECTA") {
    return (
      <div className="py-16 text-center rounded-2xl bg-white border border-gray-100">
        <p className="text-4xl mb-3">🏆</p>
        <p className="font-medium text-gray-700">Eliminación Directa</p>
        <p className="text-sm text-gray-400 mt-1">
          La tabla de posiciones no aplica para este formato. Sigue el fixture en la pestaña Calendario.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Leyenda de puntos */}
      <div className="flex items-center gap-4 text-xs text-gray-500 bg-white rounded-xl border border-gray-100 px-4 py-2.5">
        <span className="font-medium text-gray-700">Sistema de puntos:</span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
          Victoria {puntosVictoria} pts
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-yellow-400" />
          Empate {puntosEmpate} pts
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full bg-red-400" />
          Derrota {puntosDerrota} pts
        </span>
      </div>

      {/* Tabla */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {!hayPartidos && (
          <div className="border-b border-amber-100 bg-amber-50 px-5 py-3 text-sm text-amber-700">
            📋 Aún no hay partidos con acta cerrada. La tabla se actualizará al registrar resultados.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 w-8">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Equipo</th>
                {["PJ","PG","PE","PP","GF","GC","DG"].map((h) => (
                  <th key={h} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 w-10">{h}</th>
                ))}
                <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wide text-gray-700 w-12">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {standings.map((row, idx) => (
                <tr
                  key={row.equipoId}
                  className={`transition-colors hover:bg-gray-50 ${idx < 3 && hayPartidos ? "bg-opacity-50" : ""}`}
                >
                  <td className="px-4 py-3 text-center">
                    {hayPartidos && MEDAL[idx]
                      ? <span className="text-base">{MEDAL[idx]}</span>
                      : <span className="text-xs font-bold text-gray-500">{idx + 1}</span>
                    }
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                        {row.logo
                          ? <img src={row.logo} alt={row.nombre} className="h-full w-full object-cover" />
                          : <span className="text-xs font-bold text-white">{row.nombre.charAt(0)}</span>
                        }
                      </div>
                      <span className="font-medium text-gray-900 truncate max-w-[140px]">{row.nombre}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-gray-600">{row.PJ}</td>
                  <td className="px-3 py-3 text-center font-medium text-green-700">{row.PG}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{row.PE}</td>
                  <td className="px-3 py-3 text-center text-red-600">{row.PP}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{row.GF}</td>
                  <td className="px-3 py-3 text-center text-gray-600">{row.GC}</td>
                  <td className={`px-3 py-3 text-center font-medium ${
                    row.DG > 0 ? "text-green-600" : row.DG < 0 ? "text-red-500" : "text-gray-500"
                  }`}>
                    {row.DG > 0 ? `+${row.DG}` : row.DG}
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                      idx === 0 && hayPartidos ? "bg-green-600 text-white" : "bg-gray-100 text-gray-800"
                    }`}>
                      {row.Pts}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda columnas */}
      <p className="text-xs text-gray-400 px-1">
        PJ: Partidos jugados · PG: Ganados · PE: Empates · PP: Perdidos ·
        GF: Goles a favor · GC: Goles en contra · DG: Diferencia de goles · Pts: Puntos
      </p>
    </div>
  );
}
