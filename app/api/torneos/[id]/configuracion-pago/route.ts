import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { configuracionPagoSchema } from "@/lib/validations";

type Ctx = { params: { id: string } };

export async function GET(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const config = await prisma.configuracionPago.findUnique({
    where: { torneoId: params.id },
  });

  return NextResponse.json(config ?? null);
}

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({ where: { id: params.id } });
  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  const isAdmin = session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body   = await req.json();
  const parsed = configuracionPagoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const {
    banco, telefono, cedula, titular,
    fechaLimitePrimeraCuota, fechaLimiteSegundaCuota,
    ...rest
  } = parsed.data;

  const config = await prisma.configuracionPago.upsert({
    where:  { torneoId: params.id },
    create: {
      torneoId: params.id,
      ...rest,
      datosPagoMovil: { banco, telefono, cedula, titular },
      fechaLimitePrimeraCuota: fechaLimitePrimeraCuota ? new Date(fechaLimitePrimeraCuota) : null,
      fechaLimiteSegundaCuota: fechaLimiteSegundaCuota ? new Date(fechaLimiteSegundaCuota) : null,
    },
    update: {
      ...rest,
      datosPagoMovil: { banco, telefono, cedula, titular },
      fechaLimitePrimeraCuota: fechaLimitePrimeraCuota ? new Date(fechaLimitePrimeraCuota) : null,
      fechaLimiteSegundaCuota: fechaLimiteSegundaCuota ? new Date(fechaLimiteSegundaCuota) : null,
    },
  });

  return NextResponse.json(config);
}
