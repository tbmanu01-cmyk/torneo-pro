import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { equipoSchema } from "@/lib/validations";
import type { EstadoPago } from "@prisma/client";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const equipos = await prisma.equipo.findMany({
    where: { torneoId: params.id },
    include: {
      capitan:  { select: { id: true, name: true } },
      _count:   { select: { jugadores: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(equipos);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  if (session.user.role !== "SUPER_ADMIN" && torneo.adminId !== session.user.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = equipoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const equipo = await prisma.equipo.create({
    data: {
      nombre:     parsed.data.nombre,
      logo:       parsed.data.logo,
      capitanId:  parsed.data.capitanId || null,
      estadoPago: (parsed.data.estadoPago ?? "PENDIENTE") as EstadoPago,
      torneoId:   params.id,
    },
    include: {
      capitan:  { select: { id: true, name: true } },
      _count:   { select: { jugadores: true } },
    },
  });

  return NextResponse.json(equipo, { status: 201 });
}
