import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import PagosAdminTable from "@/components/pagos/PagosAdminTable";
import type { PagoRow } from "@/types";

export default async function PagosAdminPage({
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

  const rawEquipos = await prisma.equipo.findMany({
    where: { torneoId: params.id },
    include: {
      capitan: { select: { name: true, email: true } },
      pagos: {
        include: { aprobadoPor: { select: { name: true } } },
        orderBy: [{ numeroCuota: "asc" }, { createdAt: "desc" }],
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const config = await prisma.configuracionPago.findUnique({
    where: { torneoId: params.id },
  });

  const pendingCount = rawEquipos.reduce(
    (acc, eq) => acc + eq.pagos.filter((p) => p.estado === "PENDIENTE").length,
    0,
  );

  const equipos = rawEquipos.map((eq) => ({
    id:         eq.id,
    nombre:     eq.nombre,
    logo:       eq.logo,
    estadoPago: eq.estadoPago as string,
    capitan:    eq.capitan,
    pagos:      eq.pagos.map((p) => ({
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
    })) satisfies PagoRow[],
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">
            ⚽ TorneoPro
          </Link>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/torneos" className="hover:text-gray-700">Torneos</Link>
            <span>/</span>
            <Link href={`/torneos/${params.id}`} className="hover:text-gray-700 max-w-[160px] truncate">
              {torneo.nombre}
            </Link>
            <span>/</span>
            <span className="text-gray-700">Pagos</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Gestión de Pagos</h1>
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <Link
            href={`/torneos/${params.id}/configuracion-pago`}
            className="flex-shrink-0 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-green-400 hover:text-green-700 transition-colors"
          >
            ⚙️ Configurar pago
          </Link>
        </div>

        <PagosAdminTable
          torneoId={params.id}
          equipos={equipos}
          hasPagosConfig={!!config}
          moneda={config?.moneda}
        />
      </main>
    </div>
  );
}
