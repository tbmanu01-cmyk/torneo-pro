-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('GOL', 'TARJETA_AMARILLA', 'TARJETA_ROJA', 'CAMBIO');

-- AlterTable
ALTER TABLE "partidos" ADD COLUMN     "cerradaPorId" TEXT,
ADD COLUMN     "fechaCierre" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "eventos_partido" (
    "id" TEXT NOT NULL,
    "partidoId" TEXT NOT NULL,
    "tipo" "TipoEvento" NOT NULL,
    "jugadorId" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "minuto" INTEGER NOT NULL DEFAULT 0,
    "asistenciaJugadorId" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "eventos_partido_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "partidos" ADD CONSTRAINT "partidos_cerradaPorId_fkey" FOREIGN KEY ("cerradaPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_partido" ADD CONSTRAINT "eventos_partido_partidoId_fkey" FOREIGN KEY ("partidoId") REFERENCES "partidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_partido" ADD CONSTRAINT "eventos_partido_jugadorId_fkey" FOREIGN KEY ("jugadorId") REFERENCES "jugadores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_partido" ADD CONSTRAINT "eventos_partido_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "eventos_partido" ADD CONSTRAINT "eventos_partido_asistenciaJugadorId_fkey" FOREIGN KEY ("asistenciaJugadorId") REFERENCES "jugadores"("id") ON DELETE SET NULL ON UPDATE CASCADE;
