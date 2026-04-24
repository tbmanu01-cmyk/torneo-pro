import { NextResponse } from "next/server";
import { auth, AppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { torneoSchema } from "@/lib/validations";
import type { FormatoTorneo, EstadoTorneo } from "@prisma/client";

type Ctx = { params: { id: string } };

function canAdmin(session: AppSession, adminId: string) {
  return session?.user.role === "SUPER_ADMIN" || session?.user.id === adminId;
}

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({
    where: { id: params.id },
    include: {
      admin:   { select: { name: true } },
      equipos: {
        include: {
          capitan:  { select: { id: true, name: true } },
          _count:   { select: { jugadores: true } },
        },
      },
    },
  });

  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  return NextResponse.json(torneo);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  if (!canAdmin(session, torneo.adminId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body   = await req.json();
  const parsed = torneoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { fechaInicio, fechaFin, estado, formato, ...rest } = parsed.data;

  const updated = await prisma.torneo.update({
    where: { id: params.id },
    data: {
      ...rest,
      ...(formato     && { formato:     formato     as FormatoTorneo }),
      ...(estado      && { estado:      estado      as EstadoTorneo }),
      ...(fechaInicio !== undefined && { fechaInicio: fechaInicio ? new Date(fechaInicio) : null }),
      ...(fechaFin    !== undefined && { fechaFin:    fechaFin    ? new Date(fechaFin)    : null }),
    },
    include: { admin: { select: { name: true } }, _count: { select: { equipos: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });
  if (!canAdmin(session, torneo.adminId)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  await prisma.torneo.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
