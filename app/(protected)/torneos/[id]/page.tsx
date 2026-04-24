import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/ui/StatusBadge";
import TorneoEquipos from "@/components/torneos/TorneoEquipos";
import type { EquipoRow } from "@/types";

const TABS = [
  { key: "equipos",      label: "Equipos" },
  { key: "calendario",   label: "Calendario" },
  { key: "tabla",        label: "Tabla" },
  { key: "estadisticas", label: "Estadísticas" },
];

function PlaceholderTab({ name }: { name: string }) {
  return (
    <div className="py-20 text-center rounded-2xl bg-white border border-gray-100">
      <p className="text-4xl mb-3">🔜</p>
      <p className="font-medium text-gray-600">{name}</p>
      <p className="text-sm text-gray-400 mt-1">Disponible en una próxima fase</p>
    </div>
  );
}

export default async function TorneoDetailPage({
  params,
  searchParams,
}: {
  params:       { id: string };
  searchParams: { tab?: string };
}) {
  const session = await requireAuth();
  const tab     = TABS.find((t) => t.key === searchParams.tab)?.key ?? "equipos";

  const torneo = await prisma.torneo.findUnique({
    where:   { id: params.id },
    include: {
      admin:   { select: { name: true } },
      equipos: {
        include: {
          capitan:  { select: { id: true, name: true } },
          _count:   { select: { jugadores: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!torneo) notFound();

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;

  const equipos: EquipoRow[] = torneo.equipos.map((e) => ({
    id:         e.id,
    nombre:     e.nombre,
    logo:       e.logo,
    torneoId:   e.torneoId,
    capitanId:  e.capitanId,
    estadoPago: e.estadoPago as EquipoRow["estadoPago"],
    capitan:    e.capitan,
    _count:     e._count,
    createdAt:  e.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">⚽ TorneoPro</Link>
          <Link href="/torneos" className="text-sm text-gray-500 hover:text-gray-700">← Torneos</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Torneo header */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                {torneo.logo ? (
                  <img src={torneo.logo} alt={torneo.nombre} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-3xl">⚽</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{torneo.nombre}</h1>
                  <span className="text-sm text-gray-400">Ed. {torneo.edicion}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <StatusBadge value={torneo.estado} />
                  <StatusBadge value={torneo.formato} />
                  <span className="text-sm text-gray-500">· {torneo.admin.name}</span>
                </div>
                {torneo.descripcion && (
                  <p className="mt-2 text-sm text-gray-500 max-w-xl">{torneo.descripcion}</p>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="flex gap-2 flex-shrink-0">
                <Link
                  href={`/torneos/${torneo.id}/editar`}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  ✏️ Editar
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-6 text-sm text-gray-500 border-t border-gray-50 pt-4">
            <span>🏆 {equipos.length} equipos</span>
            <span>🎯 V:{torneo.puntosVictoria} E:{torneo.puntosEmpate} D:{torneo.puntosDerrota}</span>
            {torneo.fechaInicio && (
              <span>
                📅 {new Date(torneo.fechaInicio).toLocaleDateString("es-ES")}
                {torneo.fechaFin && ` → ${new Date(torneo.fechaFin).toLocaleDateString("es-ES")}`}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-0 border-b border-gray-200">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`/torneos/${params.id}?tab=${t.key}`}
              className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>

        {/* Tab content */}
        {tab === "equipos"      && <TorneoEquipos torneoId={params.id} equipos={equipos} isAdmin={isAdmin} />}
        {tab === "calendario"   && <PlaceholderTab name="Calendario de Partidos" />}
        {tab === "tabla"        && <PlaceholderTab name="Tabla de Posiciones" />}
        {tab === "estadisticas" && <PlaceholderTab name="Estadísticas" />}
      </main>
    </div>
  );
}
