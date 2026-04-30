import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import ConfiguracionPagoForm from "./ConfiguracionPagoForm";
import type { ConfiguracionPagoRow, DatosPagoMovil } from "@/types";

export default async function ConfiguracionPagoPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await requireAuth();

  const torneo = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!torneo) notFound();

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  if (!isAdmin) redirect(`/torneos/${params.id}`);

  const rawConfig = await prisma.configuracionPago.findUnique({
    where: { torneoId: params.id },
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">
            ⚽ TorneoPro
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/torneos" className="hover:text-gray-700">
              Torneos
            </Link>
            <span>/</span>
            <Link
              href={`/torneos/${params.id}`}
              className="hover:text-gray-700 max-w-[180px] truncate"
            >
              {torneo.nombre}
            </Link>
            <span>/</span>
            <span className="text-gray-700">Configurar pago</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Configurar pago
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Define los datos bancarios y montos de inscripción para{" "}
              <span className="font-medium">{torneo.nombre}</span>
            </p>
          </div>
          <Link
            href={`/torneos/${params.id}/pagos`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors"
          >
            Ver pagos
          </Link>
        </div>

        <ConfiguracionPagoForm torneoId={params.id} initialData={config} />
      </main>
    </div>
  );
}
