"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { equipoSchema } from "@/lib/validations";
import type { EstadoPago } from "@prisma/client";

async function getSession() {
  const s = await getServerSession(authOptions);
  if (!s) redirect("/login");
  return s;
}

export async function createEquipo(torneoId: string, data: unknown) {
  const session = await getSession();

  const torneo = await prisma.torneo.findUnique({ where: { id: torneoId } });
  if (!torneo) return { error: "Torneo no encontrado" };

  const canAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  if (!canAdmin) return { error: "No autorizado" };

  const parsed = equipoSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const equipo = await prisma.equipo.create({
      data: {
        nombre:     parsed.data.nombre,
        logo:       parsed.data.logo,
        capitanId:  parsed.data.capitanId || null,
        estadoPago: (parsed.data.estadoPago ?? "PENDIENTE") as EstadoPago,
        torneoId,
      },
      include: { capitan: { select: { id: true, name: true } }, _count: { select: { jugadores: true } } },
    });
    revalidatePath(`/torneos/${torneoId}`);
    return { equipo };
  } catch {
    return { error: "Error al crear equipo" };
  }
}

export async function updateEquipo(id: string, data: unknown) {
  const session = await getSession();

  const equipo = await prisma.equipo.findUnique({
    where: { id },
    include: { torneo: { select: { adminId: true, id: true } } },
  });
  if (!equipo) return { error: "Equipo no encontrado" };

  const canEdit =
    session.user.role === "SUPER_ADMIN" ||
    session.user.id   === equipo.torneo.adminId ||
    session.user.id   === equipo.capitanId;
  if (!canEdit) return { error: "No autorizado" };

  const parsed = equipoSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  try {
    const updated = await prisma.equipo.update({
      where: { id },
      data: {
        ...parsed.data,
        capitanId:  parsed.data.capitanId !== undefined ? parsed.data.capitanId || null : undefined,
        estadoPago: parsed.data.estadoPago as EstadoPago | undefined,
      },
      include: { capitan: { select: { id: true, name: true } }, _count: { select: { jugadores: true } } },
    });
    revalidatePath(`/torneos/${equipo.torneo.id}`);
    return { equipo: updated };
  } catch {
    return { error: "Error al actualizar equipo" };
  }
}

export async function deleteEquipo(id: string) {
  const session = await getSession();

  const equipo = await prisma.equipo.findUnique({
    where: { id },
    include: { torneo: { select: { adminId: true, id: true } } },
  });
  if (!equipo) return { error: "Equipo no encontrado" };

  const canDelete =
    session.user.role === "SUPER_ADMIN" || session.user.id === equipo.torneo.adminId;
  if (!canDelete) return { error: "No autorizado" };

  try {
    await prisma.equipo.delete({ where: { id } });
    revalidatePath(`/torneos/${equipo.torneo.id}`);
    return { success: true };
  } catch {
    return { error: "Error al eliminar equipo" };
  }
}
