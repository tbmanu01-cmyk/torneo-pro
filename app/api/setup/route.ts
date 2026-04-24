import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Endpoint de configuración inicial: promueve al primer usuario a SUPER_ADMIN
// Úsalo una sola vez: POST /api/setup
export async function POST() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
  });

  if (existingAdmin) {
    return NextResponse.json({
      message: `Ya existe un SUPER_ADMIN: ${existingAdmin.email}`,
    });
  }

  const firstUser = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!firstUser) {
    return NextResponse.json({ error: "No hay usuarios registrados" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: firstUser.id },
    data: { role: "SUPER_ADMIN" },
  });

  return NextResponse.json({
    message: `✓ ${firstUser.email} ahora es SUPER_ADMIN`,
  });
}
