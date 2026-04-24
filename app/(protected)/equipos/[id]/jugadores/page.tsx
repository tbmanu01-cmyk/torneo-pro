import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/ui/StatusBadge";
import JugadoresManager from "@/components/jugadores/JugadoresManager";
import type { JugadorRow } from "@/types";

export default async function JugadoresPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();

  const equipo = await prisma.equipo.findUnique({
    where:   { id: params.id },
    include: {
      torneo:   { select: { id: true, nombre: true, adminId: true } },
      capitan:  { select: { name: true } },
      jugadores: { orderBy: { numeroJugador: "asc" } },
    },
  });

  if (!equipo) notFound();

  const canEdit =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === equipo.torneo.adminId ||
    session.user.id   === equipo.capitanId;

  const jugadores: JugadorRow[] = equipo.jugadores.map((j) => ({
    id:                j.id,
    nombre:            j.nombre,
    numeroJugador:     j.numeroJugador,
    equipoId:          j.equipoId,
    tarjetasAmarillas: j.tarjetasAmarillas,
    tarjetasRojas:     j.tarjetasRojas,
    suspendido:        j.suspendido,
    goles:             j.goles,
    asistencias:       j.asistencias,
    createdAt:         j.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href={`/torneos/${equipo.torneo.id}`} className="text-lg font-bold text-green-600">
            ⚽ TorneoPro
          </Link>
          <Link
            href={`/torneos/${equipo.torneo.id}?tab=equipos`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← {equipo.torneo.nombre}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Equipo header */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              {equipo.logo ? (
                <img src={equipo.logo} alt={equipo.nombre} className="h-full w-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {equipo.nombre.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{equipo.nombre}</h1>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge value={equipo.estadoPago} />
                {equipo.capitan && (
                  <span className="text-sm text-gray-500">👤 {equipo.capitan.name}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <JugadoresManager
          equipoId={equipo.id}
          jugadores={jugadores}
          canEdit={canEdit}
          bloqueado={equipo.estadoPago === "BLOQUEADO"}
        />
      </main>
    </div>
  );
}
