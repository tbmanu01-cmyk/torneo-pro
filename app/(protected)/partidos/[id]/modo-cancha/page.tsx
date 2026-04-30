import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import ModoCancha from "@/components/cancha/ModoCancha";

export default async function ModoCanchaPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();

  const partido = await prisma.partido.findUnique({
    where:   { id: params.id },
    include: {
      jornada: {
        include: {
          torneo: { select: { id: true, nombre: true, adminId: true } },
        },
      },
      equipoLocal: {
        select: {
          id:         true,
          nombre:     true,
          logo:       true,
          estadoPago: true,
          jugadores: {
            orderBy: { numeroJugador: "asc" },
            select: {
              id:                true,
              nombre:            true,
              numeroJugador:     true,
              goles:             true,
              asistencias:       true,
              tarjetasAmarillas: true,
              tarjetasRojas:     true,
              suspendido:        true,
            },
          },
        },
      },
      equipoVisitante: {
        select: {
          id:         true,
          nombre:     true,
          logo:       true,
          estadoPago: true,
          jugadores: {
            orderBy: { numeroJugador: "asc" },
            select: {
              id:                true,
              nombre:            true,
              numeroJugador:     true,
              goles:             true,
              asistencias:       true,
              tarjetasAmarillas: true,
              tarjetasRojas:     true,
              suspendido:        true,
            },
          },
        },
      },
      eventos: {
        include: {
          jugador:           { select: { id: true, nombre: true, numeroJugador: true } },
          equipo:            { select: { id: true, nombre: true } },
          asistenciaJugador: { select: { id: true, nombre: true } },
        },
        orderBy: [{ minuto: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!partido) notFound();

  const isAdmin =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === partido.jornada.torneo.adminId;
  const isAsistente = session.user.role === "ASISTENTE";

  if (!isAdmin && !isAsistente) {
    redirect(`/torneos/${partido.jornada.torneo.id}?tab=calendario`);
  }

  return (
    <ModoCancha
      partido={{
        ...partido,
        equipoLocal:     partido.equipoLocal     ? { ...partido.equipoLocal,     estadoPago: partido.equipoLocal.estadoPago     as string } : null,
        equipoVisitante: partido.equipoVisitante ? { ...partido.equipoVisitante, estadoPago: partido.equipoVisitante.estadoPago as string } : null,
        eventos:         partido.eventos as any,
        jornada: {
          id:     partido.jornada.id,
          numero: partido.jornada.numero,
          nombre: partido.jornada.nombre,
          torneo: partido.jornada.torneo,
        },
      }}
      isAdmin={isAdmin}
    />
  );
}
