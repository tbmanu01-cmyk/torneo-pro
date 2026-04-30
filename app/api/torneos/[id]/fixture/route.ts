import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const jornadas = await prisma.jornada.findMany({
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

  return NextResponse.json(jornadas);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const actaCerrada = await prisma.partido.count({
    where: { jornada: { torneoId: params.id }, actaCerrada: true },
  });
  if (actaCerrada > 0) {
    return NextResponse.json(
      { error: "No se puede eliminar: hay partidos con acta cerrada" },
      { status: 409 },
    );
  }

  await prisma.jornada.deleteMany({ where: { torneoId: params.id } });
  return NextResponse.json({ ok: true });
}
