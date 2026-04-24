import { requireAuth } from "@/lib/auth-guards";
import { redirect } from "next/navigation";
import Link from "next/link";
import TorneoForm from "@/components/torneos/TorneoForm";

export default async function CrearTorneoPage() {
  const session = await requireAuth();

  if (!["SUPER_ADMIN", "ADMIN_TORNEO"].includes(session.user.role)) {
    redirect("/torneos");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/torneos" className="text-lg font-bold text-green-600">⚽ TorneoPro</Link>
          <Link href="/torneos" className="text-sm text-gray-500 hover:text-gray-700">
            ← Volver a torneos
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear Torneo</h1>
          <p className="text-sm text-gray-500 mt-1">Configura los parámetros de tu nuevo torneo</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <TorneoForm />
        </div>
      </main>
    </div>
  );
}
