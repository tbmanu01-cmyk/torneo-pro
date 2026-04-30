import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const equipo = await prisma.equipo.findUnique({
    where:   { id: params.id },
    include: { torneo: { select: { adminId: true } } },
  });
  if (!equipo) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });

  const isAdmin   = session.user.role === "SUPER_ADMIN" || session.user.id === equipo.torneo.adminId;
  const isCapitan = session.user.id === equipo.capitanId;
  if (!isAdmin && !isCapitan) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const pagos = await prisma.pago.findMany({
    where:   { equipoId: params.id },
    include: { aprobadoPor: { select: { name: true } } },
    orderBy: [{ numeroCuota: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(pagos);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const equipo = await prisma.equipo.findUnique({
    where:   { id: params.id },
    include: { torneo: { select: { id: true, adminId: true } } },
  });
  if (!equipo) return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 });

  const isAdmin   = session.user.role === "SUPER_ADMIN" || session.user.id === equipo.torneo.adminId;
  const isCapitan = session.user.id === equipo.capitanId;
  if (!isAdmin && !isCapitan) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { monto, numeroCuota, comprobante, numeroReferencia } = body as {
    monto: number; numeroCuota: number; comprobante: string; numeroReferencia?: string;
  };

  if (!monto || !comprobante) {
    return NextResponse.json({ error: "Monto y comprobante son requeridos" }, { status: 400 });
  }

  // Check if there's already a PENDIENTE or APROBADO pago for this cuota
  const existing = await prisma.pago.findFirst({
    where: {
      equipoId:    params.id,
      numeroCuota: numeroCuota ?? 1,
      estado:      { in: ["PENDIENTE", "APROBADO"] },
    },
  });
  if (existing?.estado === "APROBADO") {
    return NextResponse.json(
      { error: "Esta cuota ya fue aprobada" },
      { status: 409 },
    );
  }
  if (existing?.estado === "PENDIENTE") {
    return NextResponse.json(
      { error: "Ya tienes un comprobante en revisión para esta cuota" },
      { status: 409 },
    );
  }

  const pago = await prisma.pago.create({
    data: {
      equipoId:        params.id,
      torneoId:        equipo.torneo.id,
      monto,
      numeroCuota:     numeroCuota ?? 1,
      comprobante,
      numeroReferencia: numeroReferencia ?? null,
    },
  });

  return NextResponse.json(pago, { status: 201 });
}
