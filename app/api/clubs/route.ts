import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const clubs = await prisma.club.findMany({
    include: {
      capitan: { select: { id: true, name: true, email: true } },
      _count:  { select: { equipos: true } },
    },
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json(clubs);
}
