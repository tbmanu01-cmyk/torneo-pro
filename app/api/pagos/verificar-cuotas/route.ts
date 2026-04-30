import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(_req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const ahora = new Date();
  let bloqueados = 0;

  const configs = await prisma.configuracionPago.findMany({
    where: {
      OR: [
        { fechaLimitePrimeraCuota: { lt: ahora } },
        { fechaLimiteSegundaCuota: { lt: ahora } },
      ],
    },
  });

  for (const config of configs) {
    // Block: primera cuota vencida y sin pago aprobado
    if (config.fechaLimitePrimeraCuota && config.fechaLimitePrimeraCuota < ahora) {
      const result = await prisma.equipo.updateMany({
        where: {
          torneoId:   config.torneoId,
          estadoPago: "PENDIENTE",
          NOT: {
            pagos: { some: { estado: "APROBADO", numeroCuota: 1 } },
          },
        },
        data: { estadoPago: "BLOQUEADO" },
      });
      bloqueados += result.count;
    }

    // Block: segunda cuota vencida y sin segunda cuota aprobada
    if (
      config.permiteCuotas &&
      config.numeroCuotas === 2 &&
      config.fechaLimiteSegundaCuota &&
      config.fechaLimiteSegundaCuota < ahora
    ) {
      const result = await prisma.equipo.updateMany({
        where: {
          torneoId:   config.torneoId,
          estadoPago: { not: "PAGADO" },
          NOT: {
            pagos: { some: { estado: "APROBADO", numeroCuota: 2 } },
          },
        },
        data: { estadoPago: "BLOQUEADO" },
      });
      bloqueados += result.count;
    }
  }

  return NextResponse.json({ bloqueados });
}
