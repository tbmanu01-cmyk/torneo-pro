import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jugadorSchema } from "@/lib/validations";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const jugadores = await prisma.jugador.findMany({
    where: { equipoId: params.id },
    orderBy: { numeroJugador: "asc" },
  });

  return NextResponse.json(jugadores);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const equipo = await prisma.equipo.findUnique({
    where: { id: params.id },
    include: { torneo: { select: { adminId: true } } },
  });
  if (!equipo) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });

  if (equipo.estadoPago === "BLOQUEADO") {
    return NextResponse.json({ error: "Equipo bloqueado por falta de pago" }, { status: 403 });
  }

  const canAdd =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === equipo.torneo.adminId ||
    session.user.id   === equipo.capitanId;

  if (!canAdd) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body   = await req.json();
  const parsed = jugadorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const dorsalEnUso = await prisma.jugador.findFirst({
    where: { equipoId: params.id, numeroJugador: parsed.data.numeroJugador },
  });
  if (dorsalEnUso) {
    return NextResponse.json({ error: `El dorsal #${parsed.data.numeroJugador} ya está en uso` }, { status: 409 });
  }

  const jugador = await prisma.jugador.create({
    data: { ...parsed.data, equipoId: params.id },
  });

  return NextResponse.json(jugador, { status: 201 });
}
