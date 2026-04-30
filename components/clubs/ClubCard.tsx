"use client";

import type { ClubRow } from "@/types";

interface Props {
  club:       ClubRow;
  canEdit:    boolean;
  onEdit:     (c: ClubRow) => void;
  onDelete:   (id: string) => void;
  isPending:  boolean;
}

export default function ClubCard({ club, canEdit, onEdit, onDelete, isPending }: Props) {
  const initial = club.nombre.charAt(0).toUpperCase();

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-gray-50">
        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
          {club.logo
            ? <img src={club.logo} alt={club.nombre} className="h-full w-full object-cover" />
            : <span className="text-2xl font-bold text-white">{initial}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{club.nombre}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {club.ciudad ? `📍 ${club.ciudad}` : "Sin ciudad"}
          </p>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center justify-between text-sm text-gray-500">
        <span>
          {club.capitan
            ? `👤 ${club.capitan.name}`
            : <span className="text-amber-500">Sin capitán</span>
          }
        </span>
        <span className="text-gray-400">
          🏆 {club._count.equipos} torneo{club._count.equipos !== 1 ? "s" : ""}
        </span>
      </div>

      {canEdit && (
        <div className="px-4 pb-4 flex gap-2">
          <button
            onClick={() => onEdit(club)}
            disabled={isPending}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-40"
          >
            ✏️ Editar
          </button>
          <button
            onClick={() => onDelete(club.id)}
            disabled={isPending}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
          >
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}
