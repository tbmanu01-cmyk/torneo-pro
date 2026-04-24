"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createUserAdminSchema, updateUserAdminSchema } from "@/lib/validations";
import type { Role } from "@prisma/client";

async function guardSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "SUPER_ADMIN") {
    throw new Error("No autorizado");
  }
  return session;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  try {
    await guardSuperAdmin();

    const parsed = createUserAdminSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return { error: "Ya existe un usuario con ese email" };

    const hashed = await bcrypt.hash(parsed.data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: hashed,
        role: parsed.data.role as Role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    revalidatePath("/admin/users");
    return { user };
  } catch (e) {
    if (e instanceof Error && e.message === "No autorizado") {
      return { error: "No autorizado" };
    }
    return { error: "Error interno del servidor" };
  }
}

export async function updateUser(id: string, data: { name: string; role: string }) {
  try {
    await guardSuperAdmin();

    const parsed = updateUserAdminSchema.safeParse(data);
    if (!parsed.success) return { error: parsed.error.errors[0].message };

    const user = await prisma.user.update({
      where: { id },
      data: { name: parsed.data.name, role: parsed.data.role as Role },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    revalidatePath("/admin/users");
    return { user };
  } catch (e) {
    if (e instanceof Error && e.message === "No autorizado") {
      return { error: "No autorizado" };
    }
    return { error: "Error al actualizar usuario" };
  }
}

export async function deleteUser(id: string) {
  try {
    const session = await guardSuperAdmin();

    if (id === session.user.id) {
      return { error: "No puedes eliminar tu propia cuenta" };
    }

    await prisma.user.delete({ where: { id } });
    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    if (e instanceof Error && e.message === "No autorizado") {
      return { error: "No autorizado" };
    }
    return { error: "Error al eliminar usuario" };
  }
}
