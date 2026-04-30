import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Ctx = { params: { id: string } };

export async function PATCH(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const pago = await prisma.pago.findUnique({
    where:   { id: params.id },
    include: {
      torneo: { select: { adminId: true } },
      equipo: { select: { id: true, estadoPago: true } },
    },
  });
  if (!pago) return NextResponse.json({ error: "Pago no encontrado" }, { status: 404 });

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.id === pago.torneo.adminId;
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (pago.estado === "APROBADO") {
    return NextResponse.json({ error: "Este pago ya fue aprobado" }, { status: 409 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.pago.update({
      where: { id: params.id },
      data: {
        estado:          "APROBADO",
        aprobadoPorId:   session.user.id,
        fechaAprobacion: new Date(),
      },
    });

    // Determine if equipo is fully paid
    const config = await tx.configuracionPago.findUnique({
      where: { torneoId: pago.torneoId },
    });

    const approvedCuotas = await tx.pago.findMany({
      where:    { equipoId: pago.equipoId, torneoId: pago.torneoId, estado: "APROBADO" },
      select:   { numeroCuota: true },
      distinct: ["numeroCuota"],
    });

    const requiredCuotas = config?.permiteCuotas && config.numeroCuotas === 2 ? 2 : 1;
    const approvedCount  = approvedCuotas.length;

    let nuevoEstado: "PARCIAL" | "PAGADO" | null = null;
    if (approvedCount >= requiredCuotas) {
      nuevoEstado = "PAGADO";
    } else if (requiredCuotas === 2 && approvedCount === 1) {
      nuevoEstado = "PARCIAL";
    }

    if (nuevoEstado) {
      await tx.equipo.update({
        where: { id: pago.equipoId },
        data:  { estadoPago: nuevoEstado },
      });
    }
  });

  return NextResponse.json({ success: true });
}
