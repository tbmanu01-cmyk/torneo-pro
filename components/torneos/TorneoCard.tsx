"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";
import StatusBadge from "@/components/ui/StatusBadge";
import { deleteTorneo, cloneTorneo } from "@/lib/actions/torneos";
import type { TorneoRow } from "@/types";

interface TorneoCardProps {
  torneo:   TorneoRow;
  isAdmin:  boolean;
}

export default function TorneoCard({ torneo, isAdmin }: TorneoCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClone = () => {
    startTransition(async () => {
      const r = await cloneTorneo(torneo.id);
      if ("error" in r) toast.error(r.error!);
      else { toast.success("Torneo clonado"); router.push(`/torneos/${r.torneo.id}`); }
    });
  };

  const handleDelete = () => {
    if (!confirm(`¿Eliminar "${torneo.nombre}"? Se eliminarán todos sus equipos.`)) return;
    startTransition(async () => {
      const r = await deleteTorneo(torneo.id);
      if ("error" in r) toast.error(r.error!);
      else { toast.success("Torneo eliminado"); router.refresh(); }
    });
  };

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Logo / Banner */}
      <div className="relative h-32 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
        {torneo.logo ? (
          <img src={torneo.logo} alt={torneo.nombre} className="h-full w-full object-cover" />
        ) : (
          <span className="text-5xl">⚽</span>
        )}
        <div className="absolute top-2 right-2 flex gap-1">
          <StatusBadge value={torneo.estado} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 leading-tight">{torneo.nombre}</h3>
          <StatusBadge value={torneo.formato} />
        </div>

        {torneo.descripcion && (
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{torneo.descripcion}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
          <span>👤 {torneo.admin.name}</span>
          <span>👕 {torneo._count.equipos} equipos</span>
          <span>📋 Ed. {torneo.edicion}</span>
        </div>

        {torneo.fechaInicio && (
          <p className="text-xs text-gray-400 mb-3">
            {new Date(torneo.fechaInicio).toLocaleDateString("es-ES")}
            {torneo.fechaFin && ` → ${new Date(torneo.fechaFin).toLocaleDateString("es-ES")}`}
          </p>
        )}

        <div className="flex gap-2">
          <Link
            href={`/torneos/${torneo.id}`}
            className="flex-1 rounded-lg bg-green-600 px-3 py-1.5 text-center text-xs font-medium text-white hover:bg-green-700 transition-colors"
          >
            Ver torneo
          </Link>
          {isAdmin && (
            <>
              <button
                onClick={handleClone}
                disabled={isPending}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-40"
                title="Clonar torneo"
              >
                📋
              </button>
              <Link
                href={`/torneos/${torneo.id}/editar`}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
                title="Editar"
              >
                ✏️
              </Link>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                title="Eliminar"
              >
                🗑️
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
