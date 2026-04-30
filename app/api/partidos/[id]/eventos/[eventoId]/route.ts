import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type Ctx = { params: { id: string; eventoId: string } };

async function recalcularJugador(tx: Prisma.TransactionClient, jugadorId: string) {
  const [goles, tarjetasAmarillas, tarjetasRojas, asistencias] = await Promise.all([
    tx.eventoPartido.count({ where: { jugadorId, tipo: "GOL" } }),
    tx.eventoPartido.count({ where: { jugadorId, tipo: "TARJETA_AMARILLA" } }),
    tx.eventoPartido.count({ where: { jugadorId, tipo: "TARJETA_ROJA" } }),
    tx.eventoPartido.count({ where: { asistenciaJugadorId: jugadorId, tipo: "GOL" } }),
  ]);
  await tx.jugador.update({
    where: { id: jugadorId },
    data:  { goles, asistencias, tarjetasAmarillas, tarjetasRojas, suspendido: tarjetasRojas > 0 },
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const evento = await prisma.eventoPartido.findUnique({
    where:   { id: params.eventoId },
    include: { partido: { include: { jornada: { include: { torneo: true } } } } },
  });
  if (!evento || evento.partidoId !== params.id) {
    return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
  }
  if (evento.partido.actaCerrada) {
    return NextResponse.json({ error: "El acta ya está cerrada" }, { status: 409 });
  }

  const torneo    = evento.partido.jornada.torneo;
  const isAdmin   = session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  const isAsistente = session.user.role === "ASISTENTE";
  if (!isAdmin && !isAsistente) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const partido = evento.partido;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.eventoPartido.delete({ where: { id: params.eventoId } });

      await recalcularJugador(tx, evento.jugadorId);
      if (evento.asistenciaJugadorId) {
        await recalcularJugador(tx, evento.asistenciaJugadorId);
      }

      if (evento.tipo === "GOL") {
        const [golesLocal, golesVisitante] = await Promise.all([
          tx.eventoPartido.count({ where: { partidoId: params.id, tipo: "GOL", equipoId: partido.equipoLocalId ?? "" } }),
          tx.eventoPartido.count({ where: { partidoId: params.id, tipo: "GOL", equipoId: partido.equipoVisitanteId ?? "" } }),
        ]);
        await tx.partido.update({ where: { id: params.id }, data: { golesLocal, golesVisitante } });
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[eventos/eventoId] DELETE:", err);
    return NextResponse.json({ error: "Error al eliminar el evento" }, { status: 500 });
  }
}
