import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import TorneoForm from "@/components/torneos/TorneoForm";

export default async function EditarTorneoPage({ params }: { params: { id: string } }) {
  const session = await requireAuth();

  const torneo = await prisma.torneo.findUnique({
    where:   { id: params.id },
    include: { admin: { select: { name: true } }, _count: { select: { equipos: true } } },
  });

  if (!torneo) notFound();

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;

  if (!isAdmin) redirect(`/torneos/${params.id}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">⚽ TorneoPro</Link>
          <Link
            href={`/torneos/${params.id}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Volver al torneo
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Editar Torneo</h1>
          <p className="text-sm text-gray-500 mt-1">{torneo.nombre}</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <TorneoForm
            torneoId={params.id}
            initialData={{
              id:             torneo.id,
              nombre:         torneo.nombre,
              descripcion:    torneo.descripcion,
              logo:           torneo.logo,
              formato:        torneo.formato as "LIGA" | "ELIMINACION_DIRECTA" | "IDA_VUELTA",
              estado:         torneo.estado  as "PENDIENTE" | "EN_CURSO" | "FINALIZADO",
              puntosVictoria: torneo.puntosVictoria,
              puntosEmpate:   torneo.puntosEmpate,
              puntosDerrota:  torneo.puntosDerrota,
              edicion:        torneo.edicion,
              fechaInicio:    torneo.fechaInicio,
              fechaFin:       torneo.fechaFin,
              adminId:        torneo.adminId,
              admin:          torneo.admin,
              _count:         torneo._count,
              createdAt:      torneo.createdAt,
            }}
          />
        </div>
      </main>
    </div>
  );
}
