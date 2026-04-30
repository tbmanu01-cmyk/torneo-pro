import { requireAuth } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import ClubsManager from "@/components/clubs/ClubsManager";
import type { ClubRow } from "@/types";

export default async function ClubsPage() {
  const session = await requireAuth();

  const isSuperAdmin   = session.user.role === "SUPER_ADMIN";
  const isAdminTorneo  = session.user.role === "ADMIN_TORNEO";
  const isCapitan      = session.user.role === "CAPITAN";
  const canCreate      = isSuperAdmin || isAdminTorneo || isCapitan;

  const rawClubs = await prisma.club.findMany({
    include: {
      capitan: { select: { id: true, name: true, email: true } },
      _count:  { select: { equipos: true } },
    },
    orderBy: { nombre: "asc" },
  });

  const clubs: ClubRow[] = rawClubs.map((c) => ({
    id:        c.id,
    nombre:    c.nombre,
    logo:      c.logo,
    ciudad:    c.ciudad,
    capitanId: c.capitanId,
    capitan:   c.capitan,
    _count:    c._count,
    createdAt: c.createdAt,
  }));

  // Para el selector de capitán en el form (solo super_admin ve esto)
  const capitanes = isSuperAdmin
    ? await prisma.user.findMany({
        where:   { role: { in: ["CAPITAN", "ADMIN_TORNEO", "SUPER_ADMIN"] } },
        select:  { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Clubs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clubs.length} club{clubs.length !== 1 ? "s" : ""} registrados
          </p>
        </div>

        <ClubsManager
          clubs={clubs}
          isSuperAdmin={isSuperAdmin}
          canCreate={canCreate}
          capitanes={capitanes}
        />
      </main>
    </div>
  );
}
