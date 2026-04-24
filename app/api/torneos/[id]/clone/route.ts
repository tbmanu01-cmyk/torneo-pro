import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !["SUPER_ADMIN", "ADMIN_TORNEO"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const original = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!original) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  if (session.user.role !== "SUPER_ADMIN" && original.adminId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const clone = await prisma.torneo.create({
    data: {
      nombre:          `${original.nombre} (Edición ${original.edicion + 1})`,
      descripcion:     original.descripcion,
      logo:            original.logo,
      formato:         original.formato,
      estado:          "PENDIENTE",
      puntosVictoria:  original.puntosVictoria,
      puntosEmpate:    original.puntosEmpate,
      puntosDerrota:   original.puntosDerrota,
      edicion:         original.edicion + 1,
      adminId:         session.user.id,
      torneoOriginalId: params.id,
    },
    include: { admin: { select: { name: true } }, _count: { select: { equipos: true } } },
  });

  return NextResponse.json(clone, { status: 201 });
}
