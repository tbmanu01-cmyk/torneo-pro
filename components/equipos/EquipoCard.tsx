"use client";

import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import type { EquipoRow } from "@/types";

interface EquipoCardProps {
  equipo:   EquipoRow;
  isAdmin:  boolean;
  onEdit:   (equipo: EquipoRow) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}

export default function EquipoCard({ equipo, isAdmin, onEdit, onDelete, isPending }: EquipoCardProps) {
  const initial = equipo.nombre.charAt(0).toUpperCase();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-gray-50">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          {equipo.logo ? (
            <img src={equipo.logo} alt={equipo.nombre} className="h-full w-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-white">{initial}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{equipo.nombre}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {equipo.capitan ? `👤 ${equipo.capitan.name}` : "Sin capitán"}
          </p>
        </div>
        <StatusBadge value={equipo.estadoPago} />
      </div>

      {/* Stats */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <span>👕</span>
          <span className="font-medium">{equipo._count.jugadores}</span>
          <span className="text-gray-400">jugadores</span>
        </div>

        {equipo.estadoPago === "BLOQUEADO" && (
          <span className="text-xs text-red-600 font-medium">⚠️ Bloqueado</span>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex gap-2">
        <Link
          href={`/equipos/${equipo.id}/jugadores`}
          className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-green-700 transition-colors"
        >
          Ver plantilla
        </Link>
        <Link
          href={`/equipos/${equipo.id}/pagos`}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-center text-xs font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors"
        >
          Pagos
        </Link>
        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(equipo)}
              disabled={isPending}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40"
            >
              ✏️
            </button>
            <button
              onClick={() => onDelete(equipo.id)}
              disabled={isPending}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
            >
              🗑️
            </button>
          </>
        )}
      </div>
    </div>
  );
}
