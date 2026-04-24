import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { torneoSchema } from "@/lib/validations";
import type { FormatoTorneo, EstadoTorneo } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneos = await prisma.torneo.findMany({
    include: {
      admin:  { select: { name: true } },
      _count: { select: { equipos: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(torneos);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !["SUPER_ADMIN", "ADMIN_TORNEO"].includes(session.user.role)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = torneoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { fechaInicio, fechaFin, estado, ...rest } = parsed.data;

  const torneo = await prisma.torneo.create({
    data: {
      ...rest,
      formato:     rest.formato as FormatoTorneo,
      estado:      (estado ?? "PENDIENTE") as EstadoTorneo,
      adminId:     session.user.id,
      fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
      fechaFin:    fechaFin    ? new Date(fechaFin)    : null,
    },
    include: {
      admin:  { select: { name: true } },
      _count: { select: { equipos: true } },
    },
  });

  return NextResponse.json(torneo, { status: 201 });
}
