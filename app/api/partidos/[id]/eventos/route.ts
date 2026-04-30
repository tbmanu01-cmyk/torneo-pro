import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const eventos = await prisma.eventoPartido.findMany({
    where:   { partidoId: params.id },
    include: {
      jugador:           { select: { id: true, nombre: true, numeroJugador: true } },
      equipo:            { select: { id: true, nombre: true } },
      asistenciaJugador: { select: { id: true, nombre: true } },
    },
    orderBy: [{ minuto: "asc" }, { createdAt: "asc" }],
  });

  return NextResponse.json(eventos);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const partido = await prisma.partido.findUnique({
    where:   { id: params.id },
    include: { jornada: { include: { torneo: true } } },
  });
  if (!partido) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });
  if (partido.actaCerrada) return NextResponse.json({ error: "El acta ya está cerrada" }, { status: 409 });

  const torneo    = partido.jornada.torneo;
  const isAdmin   = session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  const isAsistente = session.user.role === "ASISTENTE";
  if (!isAdmin && !isAsistente) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json() as {
    tipo:                 string;
    jugadorId:            string;
    equipoId:             string;
    minuto?:              number;
    asistenciaJugadorId?: string;
    notas?:               string;
  };

  const { tipo, jugadorId, equipoId, minuto = 0, asistenciaJugadorId, notas } = body;
  if (!tipo || !jugadorId || !equipoId) {
    return NextResponse.json({ error: "tipo, jugadorId y equipoId son requeridos" }, { status: 400 });
  }

  const jugador = await prisma.jugador.findFirst({ where: { id: jugadorId, equipoId } });
  if (!jugador) return NextResponse.json({ error: "El jugador no pertenece a ese equipo" }, { status: 400 });

  if (equipoId !== partido.equipoLocalId && equipoId !== partido.equipoVisitanteId) {
    return NextResponse.json({ error: "El equipo no participa en este partido" }, { status: 400 });
  }

  try {
    const evento = await prisma.$transaction(async (tx) => {
      const ev = await tx.eventoPartido.create({
        data: {
          partidoId: params.id,
          tipo:      tipo as any,
          jugadorId,
          equipoId,
          minuto,
          asistenciaJugadorId: asistenciaJugadorId || null,
          notas:               notas               || null,
        },
        include: {
          jugador:           { select: { id: true, nombre: true, numeroJugador: true } },
          equipo:            { select: { id: true, nombre: true } },
          asistenciaJugador: { select: { id: true, nombre: true } },
        },
      });

      if (tipo === "GOL") {
        await tx.jugador.update({ where: { id: jugadorId }, data: { goles: { increment: 1 } } });
        const isLocal = equipoId === partido.equipoLocalId;
        await tx.partido.update({
          where: { id: params.id },
          data:  isLocal ? { golesLocal: { increment: 1 } } : { golesVisitante: { increment: 1 } },
        });
        if (asistenciaJugadorId) {
          await tx.jugador.update({ where: { id: asistenciaJugadorId }, data: { asistencias: { increment: 1 } } });
        }
      } else if (tipo === "TARJETA_AMARILLA") {
        await tx.jugador.update({ where: { id: jugadorId }, data: { tarjetasAmarillas: { increment: 1 } } });
      } else if (tipo === "TARJETA_ROJA") {
        await tx.jugador.update({ where: { id: jugadorId }, data: { tarjetasRojas: { increment: 1 }, suspendido: true } });
      }

      return ev;
    });

    return NextResponse.json(evento, { status: 201 });
  } catch (err) {
    console.error("[eventos] POST:", err);
    return NextResponse.json({ error: "Error al registrar el evento" }, { status: 500 });
  }
}
