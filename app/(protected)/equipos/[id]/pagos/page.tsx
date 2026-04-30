import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import PagosCapitanView from "./PagosCapitanView";
import type { PagoRow, ConfiguracionPagoRow, DatosPagoMovil } from "@/types";

export default async function EquipoPagosPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();

  const equipo = await prisma.equipo.findUnique({
    where:   { id: params.id },
    include: {
      torneo: { select: { id: true, nombre: true, adminId: true } },
      pagos: {
        include: { aprobadoPor: { select: { name: true } } },
        orderBy: [{ numeroCuota: "asc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!equipo) notFound();

  const isAdmin =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id === equipo.torneo.adminId;
  const isCapitan = session.user.id === equipo.capitanId;

  if (!isAdmin && !isCapitan) redirect(`/torneos/${equipo.torneoId}`);

  const rawConfig = await prisma.configuracionPago.findUnique({
    where: { torneoId: equipo.torneoId },
  });

  const config: ConfiguracionPagoRow | null = rawConfig
    ? {
        id:                      rawConfig.id,
        torneoId:                rawConfig.torneoId,
        montoInscripcion:        rawConfig.montoInscripcion,
        moneda:                  rawConfig.moneda,
        permiteCuotas:           rawConfig.permiteCuotas,
        numeroCuotas:            rawConfig.numeroCuotas,
        montoPrimeraCuota:       rawConfig.montoPrimeraCuota,
        montoSegundaCuota:       rawConfig.montoSegundaCuota,
        fechaLimitePrimeraCuota: rawConfig.fechaLimitePrimeraCuota,
        fechaLimiteSegundaCuota: rawConfig.fechaLimiteSegundaCuota,
        datosPagoMovil:          rawConfig.datosPagoMovil as DatosPagoMovil,
        instrucciones:           rawConfig.instrucciones,
        createdAt:               rawConfig.createdAt,
      }
    : null;

  const pagos: PagoRow[] = equipo.pagos.map((p) => ({
    id:               p.id,
    equipoId:         p.equipoId,
    torneoId:         p.torneoId,
    monto:            p.monto,
    numeroCuota:      p.numeroCuota,
    numeroReferencia: p.numeroReferencia,
    comprobante:      p.comprobante,
    estado:           p.estado as PagoRow["estado"],
    motivoRechazo:    p.motivoRechazo,
    aprobadoPorId:    p.aprobadoPorId,
    fechaAprobacion:  p.fechaAprobacion,
    createdAt:        p.createdAt,
    aprobadoPor:      p.aprobadoPor,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">
            ⚽ TorneoPro
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href={`/torneos/${equipo.torneo.id}`} className="hover:text-gray-700 max-w-[160px] truncate">
              {equipo.torneo.nombre}
            </Link>
            <span>/</span>
            <span className="text-gray-700 max-w-[120px] truncate">{equipo.nombre}</span>
            <span>/</span>
            <span className="text-gray-700">Pagos</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Pagos del equipo</h1>
          <p className="text-sm text-gray-500 mt-1">
            {equipo.nombre} · {equipo.torneo.nombre}
          </p>
        </div>

        <PagosCapitanView
          equipoId={equipo.id}
          estadoPago={equipo.estadoPago as string}
          config={config}
          pagos={pagos}
        />
      </main>
    </div>
  );
}
