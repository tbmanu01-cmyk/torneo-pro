import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const pago = await prisma.pago.findUnique({
    where:   { id: params.id },
    include: { torneo: { select: { adminId: true } } },
  });
  if (!pago) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.id === pago.torneo.adminId;
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (pago.estado === "RECHAZADO") {
    return NextResponse.json({ error: "Este pago ya fue rechazado" }, { status: 409 });
  }

  const body = await req.json().catch(() => ({}));
  const { motivoRechazo } = body as { motivoRechazo?: string };

  if (!motivoRechazo?.trim()) {
    return NextResponse.json({ error: "Se requiere el motivo de rechazo" }, { status: 400 });
  }

  await prisma.pago.update({
    where: { id: params.id },
    data:  { estado: "RECHAZADO", motivoRechazo: motivoRechazo.trim() },
  });

  return NextResponse.json({ success: true });
}
