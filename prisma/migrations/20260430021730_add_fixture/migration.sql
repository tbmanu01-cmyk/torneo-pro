-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN_TORNEO', 'ASISTENTE', 'CAPITAN', 'ESPECTADOR');

-- CreateEnum
CREATE TYPE "FormatoTorneo" AS ENUM ('LIGA', 'ELIMINACION_DIRECTA', 'IDA_VUELTA');

-- CreateEnum
CREATE TYPE "EstadoTorneo" AS ENUM ('PENDIENTE', 'EN_CURSO', 'FINALIZADO');

-- CreateEnum
CREATE TYPE "EstadoPago" AS ENUM ('PENDIENTE', 'PAGADO', 'BLOQUEADO');

-- CreateEnum
CREATE TYPE "EstadoJornada" AS ENUM ('PENDIENTE', 'EN_CURSO', 'FINALIZADA');

-- CreateEnum
CREATE TYPE "EstadoPartido" AS ENUM ('PENDIENTE', 'EN_CURSO', 'FINALIZADO', 'SUSPENDIDO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ESPECTADOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "torneos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "logo" TEXT,
    "formato" "FormatoTorneo" NOT NULL,
    "estado" "EstadoTorneo" NOT NULL DEFAULT 'PENDIENTE',
    "puntosVictoria" INTEGER NOT NULL DEFAULT 3,
    "puntosEmpate" INTEGER NOT NULL DEFAULT 1,
    "puntosDerrota" INTEGER NOT NULL DEFAULT 0,
    "edicion" INTEGER NOT NULL DEFAULT 1,
    "fechaInicio" TIMESTAMP(3),
    "fechaFin" TIMESTAMP(3),
    "adminId" TEXT NOT NULL,
    "torneoOriginalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "torneos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "logo" TEXT,
    "torneoId" TEXT NOT NULL,
    "capitanId" TEXT,
    "estadoPago" "EstadoPago" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jugadores" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "numeroJugador" INTEGER NOT NULL,
    "equipoId" TEXT NOT NULL,
    "tarjetasAmarillas" INTEGER NOT NULL DEFAULT 0,
    "tarjetasRojas" INTEGER NOT NULL DEFAULT 0,
    "suspendido" BOOLEAN NOT NULL DEFAULT false,
    "goles" INTEGER NOT NULL DEFAULT 0,
    "asistencias" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jugadores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jornadas" (
    "id" TEXT NOT NULL,
    "numero" INTEGER NOT NULL,
    "torneoId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha" TIMESTAMP(3),
    "estado" "EstadoJornada" NOT NULL DEFAULT 'PENDIENTE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jornadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partidos" (
    "id" TEXT NOT NULL,
    "jornadaId" TEXT NOT NULL,
    "equipoLocalId" TEXT,
    "equipoVisitanteId" TEXT,
    "golesLocal" INTEGER NOT NULL DEFAULT 0,
    "golesVisitante" INTEGER NOT NULL DEFAULT 0,
    "fecha" TIMESTAMP(3),
    "hora" TEXT,
    "cancha" TEXT,
    "estado" "EstadoPartido" NOT NULL DEFAULT 'PENDIENTE',
    "actaCerrada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partidos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "torneos" ADD CONSTRAINT "torneos_torneoOriginalId_fkey" FOREIGN KEY ("torneoOriginalId") REFERENCES "torneos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipos" ADD CONSTRAINT "equipos_capitanId_fkey" FOREIGN KEY ("capitanId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jugadores" ADD CONSTRAINT "jugadores_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jornadas" ADD CONSTRAINT "jornadas_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_jornadaId_fkey" FOREIGN KEY ("jornadaId") REFERENCES "jornadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipoLocalId_fkey" FOREIGN KEY ("equipoLocalId") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_equipoVisitanteId_fkey" FOREIGN KEY ("equipoVisitanteId") REFERENCES "equipos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
