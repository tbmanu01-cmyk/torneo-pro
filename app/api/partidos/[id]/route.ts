import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const partido = await prisma.partido.findUnique({
    where:   { id: params.id },
    include: { jornada: { include: { torneo: true } } },
  });
  if (!partido) return NextResponse.json({ error: "Partido no encontrado" }, { status: 404 });

  const torneo  = partido.jornada.torneo;
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (partido.actaCerrada) {
    return NextResponse.json({ error: "El acta de este partido ya está cerrada" }, { status: 409 });
  }

  const body = await req.json() as {
    fecha?:  string;
    hora?:   string;
    cancha?: string;
  };

  const updated = await prisma.partido.update({
    where: { id: params.id },
    data: {
      ...(body.fecha  !== undefined && { fecha:  body.fecha ? new Date(body.fecha) : null }),
      ...(body.hora   !== undefined && { hora:   body.hora  || null }),
      ...(body.cancha !== undefined && { cancha: body.cancha || null }),
    },
    include: {
      equipoLocal:     { select: { id: true, nombre: true, logo: true } },
      equipoVisitante: { select: { id: true, nombre: true, logo: true } },
    },
  });

  return NextResponse.json(updated);
}
