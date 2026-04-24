import { NextResponse } from "next/server";
import { auth, AppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jugadorSchema } from "@/lib/validations";

type Ctx = { params: { id: string } };

async function getJugadorWithPerms(id: string, session: AppSession) {
  const jugador = await prisma.jugador.findUnique({
    where: { id },
    include: {
      equipo: { include: { torneo: { select: { adminId: true } } } },
    },
  });
  if (!jugador) return null;

  const canEdit =
    session?.user.role === "SUPER_ADMIN" ||
    session?.user.id   === jugador.equipo.torneo.adminId ||
    session?.user.id   === jugador.equipo.capitanId;

  return canEdit ? jugador : null;
}

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const jugador = await getJugadorWithPerms(params.id, session);
  if (!jugador) return NextResponse.json({ error: "No encontrado o sin permisos" }, { status: 404 });

  const body   = await req.json();
  const parsed = jugadorSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const updated = await prisma.jugador.update({ where: { id: params.id }, data: parsed.data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const jugador = await getJugadorWithPerms(params.id, session);
  if (!jugador) return NextResponse.json({ error: "No encontrado o sin permisos" }, { status: 404 });

  await prisma.jugador.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
