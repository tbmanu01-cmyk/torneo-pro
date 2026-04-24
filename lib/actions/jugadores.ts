"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jugadorSchema } from "@/lib/validations";

async function getSession() {
  const s = await auth();
  if (!s) redirect("/login");
  return s;
}

async function getJugadorPerms(id: string) {
  return prisma.jugador.findUnique({
    where: { id },
    include: { equipo: { include: { torneo: { select: { adminId: true } } } } },
  });
}

export async function createJugador(equipoId: string, data: unknown) {
  const session = await getSession();

  const equipo = await prisma.equipo.findUnique({
    where: { id: equipoId },
    include: { torneo: { select: { adminId: true } } },
  });
  if (!equipo) return { error: "Equipo no encontrado" };

  if (equipo.estadoPago === "BLOQUEADO") {
    return { error: "El equipo está bloqueado por falta de pago" };
  }

  const canAdd =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === equipo.torneo.adminId ||
    session.user.id   === equipo.capitanId;
  if (!canAdd) return { error: "No autorizado" };

  const parsed = jugadorSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const dorsalEnUso = await prisma.jugador.findFirst({
    where: { equipoId, numeroJugador: parsed.data.numeroJugador },
  });
  if (dorsalEnUso) return { error: `Dorsal #${parsed.data.numeroJugador} ya está en uso` };

  try {
    const jugador = await prisma.jugador.create({ data: { ...parsed.data, equipoId } });
    revalidatePath(`/equipos/${equipoId}/jugadores`);
    return { jugador };
  } catch {
    return { error: "Error al crear jugador" };
  }
}

export async function updateJugador(id: string, data: unknown) {
  const session = await getSession();

  const jugador = await getJugadorPerms(id);
  if (!jugador) return { error: "Jugador no encontrado" };

  const canEdit =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === jugador.equipo.torneo.adminId ||
    session.user.id   === jugador.equipo.capitanId;
  if (!canEdit) return { error: "No autorizado" };

  const parsed = jugadorSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const updated = await prisma.jugador.update({ where: { id }, data: parsed.data });
    revalidatePath(`/equipos/${jugador.equipoId}/jugadores`);
    return { jugador: updated };
  } catch {
    return { error: "Error al actualizar jugador" };
  }
}

export async function deleteJugador(id: string) {
  const session = await getSession();

  const jugador = await getJugadorPerms(id);
  if (!jugador) return { error: "Jugador no encontrado" };

  const canDelete =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === jugador.equipo.torneo.adminId ||
    session.user.id   === jugador.equipo.capitanId;
  if (!canDelete) return { error: "No autorizado" };

  try {
    await prisma.jugador.delete({ where: { id } });
    revalidatePath(`/equipos/${jugador.equipoId}/jugadores`);
    return { success: true };
  } catch {
    return { error: "Error al eliminar jugador" };
  }
}
