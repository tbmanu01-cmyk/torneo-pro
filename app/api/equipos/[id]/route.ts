import { NextResponse } from "next/server";
import { auth, AppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { equipoSchema } from "@/lib/validations";
import type { EstadoPago } from "@prisma/client";

type Ctx = { params: { id: string } };

async function getEquipoWithAuth(id: string, session: AppSession) {
  const equipo = await prisma.equipo.findUnique({
    where: { id },
    include: { torneo: { select: { adminId: true } } },
  });
  if (!equipo) return null;

  const canEdit =
    session?.user.role === "SUPER_ADMIN" ||
    session?.user.id   === equipo.torneo.adminId ||
    session?.user.id   === equipo.capitanId;

  return canEdit ? equipo : null;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const equipo = await getEquipoWithAuth(params.id, session);
  if (!equipo) return NextResponse.json({ error: "No encontrado o sin permisos" }, { status: 404 });

  const body   = await req.json();
  const parsed = equipoSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const updated = await prisma.equipo.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      capitanId:  parsed.data.capitanId  ?? equipo.capitanId,
      estadoPago: (parsed.data.estadoPago ?? equipo.estadoPago) as EstadoPago,
    },
    include: { capitan: { select: { id: true, name: true } }, _count: { select: { jugadores: true } } },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const equipo = await prisma.equipo.findUnique({
    where: { id: params.id },
    include: { torneo: { select: { adminId: true } } },
  });
  if (!equipo) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const canDelete =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === equipo.torneo.adminId;

  if (!canDelete) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  await prisma.equipo.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
