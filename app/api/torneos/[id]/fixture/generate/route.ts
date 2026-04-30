import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateLigaFixture,
  generateIdaVueltaFixture,
  generateEliminacionFixture,
} from "@/lib/fixture-generator";

type Ctx = { params: { id: string } };

export async function POST(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const torneo = await prisma.torneo.findUnique({
    where:   { id: params.id },
    include: { equipos: { select: { id: true } } },
  });
  if (!torneo) return NextResponse.json({ error: "Torneo no encontrado" }, { status: 404 });

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.id === torneo.adminId;
  if (!isAdmin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  if (torneo.equipos.length < 2) {
    return NextResponse.json(
      { error: "Se necesitan al menos 2 equipos para generar el fixture" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const {
    fechaInicio,
    diasEntreJornadas = 7,
    horaDefault       = "15:00",
    shuffle           = false,
    confirmarRegenerar = false,
  } = body as {
    fechaInicio:        string;
    diasEntreJornadas?: number;
    horaDefault?:       string;
    shuffle?:           boolean;
    confirmarRegenerar?: boolean;
  };

  if (!fechaInicio) {
    return NextResponse.json({ error: "La fecha de inicio es requerida" }, { status: 400 });
  }

  // Check existing fixture
  const existingCount = await prisma.jornada.count({ where: { torneoId: params.id } });
  if (existingCount > 0 && !confirmarRegenerar) {
    return NextResponse.json(
      { error: "Ya existe un fixture. Envía confirmarRegenerar: true para sobreescribir.", code: "FIXTURE_EXISTS" },
      { status: 409 },
    );
  }

  // Block if any acta cerrada
  if (existingCount > 0) {
    const actaCerrada = await prisma.partido.count({
      where: { jornada: { torneoId: params.id }, actaCerrada: true },
    });
    if (actaCerrada > 0) {
      return NextResponse.json(
        { error: "No se puede regenerar: hay partidos con acta cerrada" },
        { status: 409 },
      );
    }
  }

  const opts = {
    fechaInicio:       new Date(fechaInicio),
    diasEntreJornadas: Number(diasEntreJornadas),
    horaDefault,
    shuffle:           Boolean(shuffle),
  };

  const equipoIds = torneo.equipos.map((e) => e.id);

  let jornadas;
  if (torneo.formato === "LIGA")                jornadas = generateLigaFixture(equipoIds, opts);
  else if (torneo.formato === "IDA_VUELTA")     jornadas = generateIdaVueltaFixture(equipoIds, opts);
  else                                           jornadas = generateEliminacionFixture(equipoIds, opts);

  // Transacción: borrar fixture anterior + insertar nuevo
  try {
    const result = await prisma.$transaction(
      async (tx) => {
        if (existingCount > 0) {
          await tx.jornada.deleteMany({ where: { torneoId: params.id } });
        }

        const created: Awaited<ReturnType<typeof tx.jornada.create>>[] = [];
        for (const j of jornadas) {
          const jornada = await tx.jornada.create({
            data: {
              numero:   j.numero,
              nombre:   j.nombre,
              fecha:    j.fecha,
              torneoId: params.id,
              partidos: {
                create: j.partidos.map((p) => ({
                  equipoLocalId:     p.equipoLocalId,
                  equipoVisitanteId: p.equipoVisitanteId,
                  hora:              p.hora,
                  fecha:             j.fecha,
                })),
              },
            },
            include: {
              partidos: {
                include: {
                  equipoLocal:     { select: { id: true, nombre: true, logo: true } },
                  equipoVisitante: { select: { id: true, nombre: true, logo: true } },
                },
              },
            },
          });
          created.push(jornada);
        }

        return created;
      },
      { timeout: 30000 },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    console.error("[fixture/generate] Error en transacción:", err);
    return NextResponse.json(
      { error: "Error al guardar el fixture en la base de datos" },
      { status: 500 },
    );
  }
}
