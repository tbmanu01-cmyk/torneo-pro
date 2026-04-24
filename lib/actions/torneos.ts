"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth, AppSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { torneoSchema } from "@/lib/validations";
import type { FormatoTorneo, EstadoTorneo } from "@prisma/client";

async function getSession() {
  const s = await auth();
  if (!s) redirect("/login");
  return s;
}

function canAdmin(session: NonNullable<AppSession>, adminId: string) {
  return session.user.role === "SUPER_ADMIN" || session.user.id === adminId;
}

export async function createTorneo(data: unknown) {
  const session = await getSession();
  if (!["SUPER_ADMIN", "ADMIN_TORNEO"].includes(session.user.role)) {
    return { error: "No autorizado" };
  }

  const parsed = torneoSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { fechaInicio, fechaFin, estado, ...rest } = parsed.data;

  try {
    const torneo = await prisma.torneo.create({
      data: {
        ...rest,
        formato:     rest.formato   as FormatoTorneo,
        estado:      (estado ?? "PENDIENTE") as EstadoTorneo,
        adminId:     session.user.id,
        fechaInicio: fechaInicio ? new Date(fechaInicio) : null,
        fechaFin:    fechaFin    ? new Date(fechaFin)    : null,
      },
    });
    revalidatePath("/torneos");
    return { torneo };
  } catch {
    return { error: "Error al crear torneo" };
  }
}

export async function updateTorneo(id: string, data: unknown) {
  const session = await getSession();

  const existing = await prisma.torneo.findUnique({ where: { id } });
  if (!existing)              return { error: "Torneo no encontrado" };
  if (!canAdmin(session, existing.adminId)) return { error: "No autorizado" };

  const parsed = torneoSchema.partial().safeParse(data);
  if (!parsed.success) return { error: parsed.error.errors[0].message };

  const { fechaInicio, fechaFin, estado, formato, ...rest } = parsed.data;

  try {
    const torneo = await prisma.torneo.update({
      where: { id },
      data: {
        ...rest,
        ...(formato     && { formato:     formato     as FormatoTorneo }),
        ...(estado      && { estado:      estado      as EstadoTorneo }),
        ...(fechaInicio !== undefined && { fechaInicio: fechaInicio ? new Date(fechaInicio) : null }),
        ...(fechaFin    !== undefined && { fechaFin:    fechaFin    ? new Date(fechaFin)    : null }),
      },
    });
    revalidatePath("/torneos");
    revalidatePath(`/torneos/${id}`);
    return { torneo };
  } catch {
    return { error: "Error al actualizar torneo" };
  }
}

export async function deleteTorneo(id: string) {
  const session = await getSession();

  const existing = await prisma.torneo.findUnique({ where: { id } });
  if (!existing)              return { error: "Torneo no encontrado" };
  if (!canAdmin(session, existing.adminId)) return { error: "No autorizado" };

  try {
    await prisma.torneo.delete({ where: { id } });
    revalidatePath("/torneos");
    return { success: true };
  } catch {
    return { error: "Error al eliminar torneo" };
  }
}

export async function cloneTorneo(id: string) {
  const session = await getSession();
  if (!["SUPER_ADMIN", "ADMIN_TORNEO"].includes(session.user.role)) {
    return { error: "No autorizado" };
  }

  const original = await prisma.torneo.findUnique({ where: { id } });
  if (!original)              return { error: "Torneo no encontrado" };
  if (!canAdmin(session, original.adminId)) return { error: "No autorizado" };

  try {
    const clone = await prisma.torneo.create({
      data: {
        nombre:           `${original.nombre} (Edición ${original.edicion + 1})`,
        descripcion:      original.descripcion,
        logo:             original.logo,
        formato:          original.formato,
        estado:           "PENDIENTE",
        puntosVictoria:   original.puntosVictoria,
        puntosEmpate:     original.puntosEmpate,
        puntosDerrota:    original.puntosDerrota,
        edicion:          original.edicion + 1,
        adminId:          session.user.id,
        torneoOriginalId: id,
      },
    });
    revalidatePath("/torneos");
    return { torneo: clone };
  } catch {
    return { error: "Error al clonar torneo" };
  }
}
