import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const club = await prisma.club.findUnique({
    where:   { id: params.id },
    include: {
      capitan: { select: { id: true, name: true, email: true } },
      equipos: {
        include: { torneo: { select: { id: true, nombre: true, estado: true, formato: true } } },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { equipos: true } },
    },
  });

  if (!club) return NextResponse.json({ error: "Club no encontrado" }, { status: 404 });
  return NextResponse.json(club);
}
