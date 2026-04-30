"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { clubSchema } from "@/lib/validations";

async function getSession() {
  const s = await auth();
  if (!s) redirect("/login");
  return s;
}

function canManageClub(session: Awaited<ReturnType<typeof getSession>>, capitanId: string | null) {
  return (
    session.user.role === "SUPER_ADMIN" ||
    session.user.role === "ADMIN_TORNEO" ||
    session.user.id   === capitanId
  );
}

export async function createClub(data: unknown) {
  const session = await getSession();

  if (!["SUPER_ADMIN", "ADMIN_TORNEO", "CAPITAN"].includes(session.user.role)) {
    return { error: "No autorizado" };
  }

  const parsed = clubSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  // Si es CAPITAN, se auto-asigna como capitán
  const capitanId =
    session.user.role === "CAPITAN"
      ? session.user.id
      : parsed.data.capitanId || null;

  try {
    const club = await prisma.club.create({
      data: {
        nombre:    parsed.data.nombre,
        logo:      parsed.data.logo     || null,
        ciudad:    parsed.data.ciudad   || null,
        capitanId,
      },
      include: {
        capitan: { select: { id: true, name: true, email: true } },
        _count:  { select: { equipos: true } },
      },
    });
    revalidatePath("/clubs");
    return { club };
  } catch {
    return { error: "Error al crear el club" };
  }
}

export async function updateClub(id: string, data: unknown) {
  const session = await getSession();

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return { error: "Club no encontrado" };
  if (!canManageClub(session, club.capitanId)) return { error: "No autorizado" };

  const parsed = clubSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const updated = await prisma.club.update({
      where: { id },
      data: {
        nombre:    parsed.data.nombre,
        logo:      parsed.data.logo    !== undefined ? parsed.data.logo    || null : undefined,
        ciudad:    parsed.data.ciudad  !== undefined ? parsed.data.ciudad  || null : undefined,
        capitanId: parsed.data.capitanId !== undefined
          ? parsed.data.capitanId || null
          : undefined,
      },
      include: {
        capitan: { select: { id: true, name: true, email: true } },
        _count:  { select: { equipos: true } },
      },
    });
    revalidatePath("/clubs");
    return { club: updated };
  } catch {
    return { error: "Error al actualizar el club" };
  }
}

export async function deleteClub(id: string) {
  const session = await getSession();

  const club = await prisma.club.findUnique({ where: { id } });
  if (!club) return { error: "Club no encontrado" };
  if (!canManageClub(session, club.capitanId)) return { error: "No autorizado" };

  const enTorneo = await prisma.equipo.count({ where: { clubId: id } });
  if (enTorneo > 0) {
    return { error: `Este club está inscrito en ${enTorneo} torneo(s). Retíralo primero.` };
  }

  try {
    await prisma.club.delete({ where: { id } });
    revalidatePath("/clubs");
    return { success: true };
  } catch {
    return { error: "Error al eliminar el club" };
  }
}

export async function inscribirClubEnTorneo(torneoId: string, clubId: string) {
  const session = await getSession();

  const [torneo, club] = await Promise.all([
    prisma.torneo.findUnique({ where: { id: torneoId } }),
    prisma.club.findUnique({
      where: { id: clubId },
      include: { capitan: { select: { id: true } } },
    }),
  ]);

  if (!torneo) return { error: "Torneo no encontrado" };
  if (!club)   return { error: "Club no encontrado" };

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  const isCapitan = session.user.id === club.capitanId;
  if (!isAdmin && !isCapitan) return { error: "No autorizado" };

  const yaInscrito = await prisma.equipo.findFirst({
    where: { torneoId, clubId },
  });
  if (yaInscrito) return { error: "Este club ya está inscrito en el torneo" };

  try {
    const equipo = await prisma.equipo.create({
      data: {
        nombre:    club.nombre,
        logo:      club.logo,
        torneoId,
        clubId,
        capitanId: club.capitanId,
      },
      include: {
        capitan: { select: { id: true, name: true } },
        club:    { select: { id: true, nombre: true } },
        _count:  { select: { jugadores: true } },
      },
    });
    revalidatePath(`/torneos/${torneoId}`);
    return { equipo };
  } catch {
    return { error: "Error al inscribir el club" };
  }
}
