import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function POST(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const partido = await prisma.partido.findUnique({
    where:   { id: params.id },
    include: {
      jornada:         { include: { torneo: true } },
      equipoLocal:     { include: { _count: { select: { jugadores: true } } } },
      equipoVisitante: { include: { _count: { select: { jugadores: true } } } },
    },
  });
  if (!partido) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  const torneo    = partido.jornada.torneo;
  const isAdmin   = session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  const isAsistente = session.user.role === "ASISTENTE";
  if (!isAdmin && !isAsistente) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (partido.estado === "EN_CURSO")  return NextResponse.json({ error: "El partido ya está en curso" }, { status: 409 });
  if (partido.estado === "FINALIZADO") return NextResponse.json({ error: "El partido ya finalizó" }, { status: 409 });
  if (partido.actaCerrada)             return NextResponse.json({ error: "El acta ya está cerrada" }, { status: 409 });

  if (!partido.equipoLocalId || !partido.equipoVisitanteId) {
    return NextResponse.json({ error: "El partido no tiene ambos equipos definidos" }, { status: 400 });
  }
  if ((partido.equipoLocal?._count.jugadores ?? 0) === 0) {
    return NextResponse.json({ error: "El equipo local no tiene jugadores registrados" }, { status: 400 });
  }
  if ((partido.equipoVisitante?._count.jugadores ?? 0) === 0) {
    return NextResponse.json({ error: "El equipo visitante no tiene jugadores registrados" }, { status: 400 });
  }
  if (partido.equipoLocal?.estadoPago === "BLOQUEADO") {
    return NextResponse.json({ error: "El equipo local está bloqueado por pago" }, { status: 400 });
  }
  if (partido.equipoVisitante?.estadoPago === "BLOQUEADO") {
    return NextResponse.json({ error: "El equipo visitante está bloqueado por pago" }, { status: 400 });
  }

  await prisma.partido.update({ where: { id: params.id }, data: { estado: "EN_CURSO" } });
  return NextResponse.json({ success: true });
}
