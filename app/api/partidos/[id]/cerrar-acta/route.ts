import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function POST(_req: Request, { params }: Ctx) {
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

  await prisma.partido.update({
    where: { id: params.id },
    data:  {
      actaCerrada:  true,
      estado:       "FINALIZADO",
      cerradaPorId: session.user.id,
      fechaCierre:  new Date(),
    },
  });

  return NextResponse.json({ success: true });
}
