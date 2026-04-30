"use client";

import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { PartidoRow } from "@/types";

interface Props {
  partido:  PartidoRow;
  isAdmin:  boolean;
  onEdit:   (p: PartidoRow) => void;
}

function TeamDisplay({ nombre, logo }: { nombre: string; logo: string | null }) {
  return (
    <div className="flex flex-col items-center gap-1 w-24">
      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center overflow-hidden flex-shrink-0">
        {logo
          ? <img src={logo} alt={nombre} className="h-full w-full object-cover" />
          : <span className="text-lg">👕</span>
        }
      </div>
      <span className="text-xs font-medium text-gray-800 text-center leading-tight line-clamp-2">
        {nombre}
      </span>
    </div>
  );
}

export default function PartidoCard({ partido, isAdmin, onEdit }: Props) {
  const isTBD = !partido.equipoLocalId && !partido.equipoVisitanteId;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 hover:border-green-200 transition-colors">
      {/* Equipos + marcador */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {isTBD ? (
          <div className="flex-1 text-center text-sm text-gray-400 py-2">
            Por definir
          </div>
        ) : (
          <>
            {partido.equipoLocal
              ? <TeamDisplay nombre={partido.equipoLocal.nombre} logo={partido.equipoLocal.logo} />
              : <div className="w-24 text-center text-xs text-gray-400">Por definir</div>
            }

            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              {partido.estado === "FINALIZADO" ? (
                <span className="text-xl font-bold text-gray-900 tabular-nums">
                  {partido.golesLocal} – {partido.golesVisitante}
                </span>
              ) : (
                <span className="text-sm font-semibold text-gray-400">VS</span>
              )}
              <StatusBadge value={partido.estado} />
            </div>

            {partido.equipoVisitante
              ? <TeamDisplay nombre={partido.equipoVisitante.nombre} logo={partido.equipoVisitante.logo} />
              : <div className="w-24 text-center text-xs text-gray-400">Por definir</div>
            }
          </>
        )}
      </div>

      {/* Meta + acciones */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
        {partido.fecha && (
          <span className="text-xs text-gray-500">
            {new Date(partido.fecha).toLocaleDateString("es-ES", {
              day: "2-digit", month: "short",
            })}
          </span>
        )}
        {partido.hora && (
          <span className="text-xs text-gray-500">{partido.hora}</span>
        )}
        {partido.cancha && (
          <span className="text-xs text-gray-400 max-w-[100px] truncate">{partido.cancha}</span>
        )}
        {isAdmin && !partido.actaCerrada && (
          <button
            onClick={() => onEdit(partido)}
            className="mt-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
          >
            ✏️ Editar
          </button>
        )}
        {isAdmin && !isTBD && (
          <Link
            href={`/partidos/${partido.id}/modo-cancha`}
            className="mt-0.5 text-xs text-green-600 hover:text-green-800 transition-colors"
          >
            📋 Cancha
          </Link>
        )}
        {partido.actaCerrada && (
          <span className="text-xs text-green-600 font-medium">✓ Acta cerrada</span>
        )}
      </div>
    </div>
  );
}
