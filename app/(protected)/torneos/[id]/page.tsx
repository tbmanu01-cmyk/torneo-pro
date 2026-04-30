import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/ui/StatusBadge";
import TorneoEquipos from "@/components/torneos/TorneoEquipos";
import FixtureTab from "@/components/fixture/FixtureTab";
import TablaTab, { type StandingRow } from "@/components/tabla/TablaTab";
import EstadisticasTab, { type JugadorStat } from "@/components/estadisticas/EstadisticasTab";
import type { ClubRow, EquipoRow, JornadaRow, PartidoRow, FormatoTorneo } from "@/types";

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
          capitan: { select: { id: true, name: true } },
          club:    { select: { id: true, nombre: true } },
          _count:  { select: { jugadores: true } },
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
    clubId:     e.clubId,
    capitanId:  e.capitanId,
    estadoPago: e.estadoPago as EquipoRow["estadoPago"],
    capitan:    e.capitan,
    club:       e.club,
    _count:     e._count,
    createdAt:  e.createdAt,
  }));

  // Clubs para el modal de inscripción
  const rawClubs = await prisma.club.findMany({
    include: {
      capitan: { select: { id: true, name: true, email: true } },
      _count:  { select: { equipos: true } },
    },
    orderBy: { nombre: "asc" },
  });

  const clubs: ClubRow[] = rawClubs.map((c) => ({
    id:        c.id,
    nombre:    c.nombre,
    logo:      c.logo,
    ciudad:    c.ciudad,
    capitanId: c.capitanId,
    capitan:   c.capitan,
    _count:    c._count,
    createdAt: c.createdAt,
  }));

  // ── Tabla de posiciones ───────────────────────────────────────────────────
  let standings: StandingRow[] = [];
  if (tab === "tabla") {
    const partidos = await prisma.partido.findMany({
      where:  { jornada: { torneoId: params.id }, actaCerrada: true },
      select: { equipoLocalId: true, equipoVisitanteId: true, golesLocal: true, golesVisitante: true },
    });

    standings = equipos.map((eq) => {
      let PJ = 0, PG = 0, PE = 0, PP = 0, GF = 0, GC = 0;

      for (const p of partidos) {
        if (p.equipoLocalId === eq.id) {
          PJ++; GF += p.golesLocal; GC += p.golesVisitante;
          if (p.golesLocal > p.golesVisitante)      PG++;
          else if (p.golesLocal === p.golesVisitante) PE++;
          else                                        PP++;
        }
        if (p.equipoVisitanteId === eq.id) {
          PJ++; GF += p.golesVisitante; GC += p.golesLocal;
          if (p.golesVisitante > p.golesLocal)       PG++;
          else if (p.golesVisitante === p.golesLocal) PE++;
          else                                        PP++;
        }
      }

      const Pts = PG * torneo.puntosVictoria + PE * torneo.puntosEmpate + PP * torneo.puntosDerrota;
      return { equipoId: eq.id, nombre: eq.nombre, logo: eq.logo, PJ, PG, PE, PP, GF, GC, DG: GF - GC, Pts };
    }).sort((a, b) =>
      b.Pts - a.Pts || b.DG - a.DG || b.GF - a.GF || a.nombre.localeCompare(b.nombre)
    );
  }

  // ── Estadísticas ──────────────────────────────────────────────────────────
  let jugadoresStats: JugadorStat[] = [];
  if (tab === "estadisticas") {
    const rawJugadores = await prisma.jugador.findMany({
      where:   { equipo: { torneoId: params.id } },
      include: { equipo: { select: { id: true, nombre: true, logo: true } } },
      orderBy: { goles: "desc" },
    });
    jugadoresStats = rawJugadores.map((j) => ({
      id:                j.id,
      nombre:            j.nombre,
      numeroJugador:     j.numeroJugador,
      equipoId:          j.equipoId,
      equipoNombre:      j.equipo.nombre,
      equipoLogo:        j.equipo.logo,
      goles:             j.goles,
      asistencias:       j.asistencias,
      tarjetasAmarillas: j.tarjetasAmarillas,
      tarjetasRojas:     j.tarjetasRojas,
      suspendido:        j.suspendido,
    }));
  }

  // ── Fixture ───────────────────────────────────────────────────────────────
  let jornadas: JornadaRow[] = [];
  if (tab === "calendario") {
    const raw = await prisma.jornada.findMany({
      where:   { torneoId: params.id },
      include: {
        partidos: {
          include: {
            equipoLocal:     { select: { id: true, nombre: true, logo: true } },
            equipoVisitante: { select: { id: true, nombre: true, logo: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { numero: "asc" },
    });

    jornadas = raw.map((j) => ({
      id:        j.id,
      numero:    j.numero,
      torneoId:  j.torneoId,
      nombre:    j.nombre,
      fecha:     j.fecha,
      estado:    j.estado as JornadaRow["estado"],
      createdAt: j.createdAt,
      partidos:  j.partidos.map((p) => ({
        id:                p.id,
        jornadaId:         p.jornadaId,
        equipoLocalId:     p.equipoLocalId,
        equipoVisitanteId: p.equipoVisitanteId,
        golesLocal:        p.golesLocal,
        golesVisitante:    p.golesVisitante,
        fecha:             p.fecha,
        hora:              p.hora,
        cancha:            p.cancha,
        estado:            p.estado as PartidoRow["estado"],
        actaCerrada:       p.actaCerrada,
        equipoLocal:       p.equipoLocal,
        equipoVisitante:   p.equipoVisitante,
        createdAt:         p.createdAt,
      })),
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">⚽ TorneoPro</Link>
          <Link href="/torneos" className="text-sm text-gray-500 hover:text-gray-700">← Torneos</Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header torneo */}
        <div className="mb-8 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                {torneo.logo
                  ? <img src={torneo.logo} alt={torneo.nombre} className="h-full w-full object-cover" />
                  : <span className="text-3xl">⚽</span>
                }
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
              <div className="flex flex-shrink-0 gap-2">
                <Link
                  href={`/torneos/${torneo.id}/pagos`}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  Pagos
                </Link>
                <Link
                  href={`/torneos/${torneo.id}/editar`}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
                >
                  ✏️ Editar
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-6 text-sm text-gray-500 border-t border-gray-50 pt-4 flex-wrap">
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

        {tab === "equipos" && (
          <TorneoEquipos
            torneoId={params.id}
            equipos={equipos}
            clubs={clubs}
            isAdmin={isAdmin}
          />
        )}
        {tab === "calendario" && (
          <FixtureTab
            torneoId={params.id}
            formato={torneo.formato as FormatoTorneo}
            numEquipos={equipos.length}
            jornadas={jornadas}
            isAdmin={isAdmin}
          />
        )}
        {tab === "tabla" && (
          <TablaTab
            standings={standings}
            formato={torneo.formato as FormatoTorneo}
            puntosVictoria={torneo.puntosVictoria}
            puntosEmpate={torneo.puntosEmpate}
            puntosDerrota={torneo.puntosDerrota}
          />
        )}
        {tab === "estadisticas" && (
          <EstadisticasTab jugadores={jugadoresStats} />
        )}
      </main>
    </div>
  );
}
