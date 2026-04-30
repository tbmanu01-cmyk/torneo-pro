-- CreateEnum
CREATE TYPE "EstadoComprobante" AS ENUM ('PENDIENTE', 'APROBADO', 'RECHAZADO');

-- CreateTable
CREATE TABLE "configuraciones_pago" (
    "id" TEXT NOT NULL,
    "torneoId" TEXT NOT NULL,
    "montoInscripcion" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'COP',
    "permiteCuotas" BOOLEAN NOT NULL DEFAULT false,
    "numeroCuotas" INTEGER,
    "montoPrimeraCuota" DOUBLE PRECISION,
    "montoSegundaCuota" DOUBLE PRECISION,
    "fechaLimitePrimeraCuota" TIMESTAMP(3),
    "fechaLimiteSegundaCuota" TIMESTAMP(3),
    "datosBancarios" JSONB NOT NULL,
    "instrucciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuraciones_pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagos" (
    "id" TEXT NOT NULL,
    "equipoId" TEXT NOT NULL,
    "torneoId" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "numeroCuota" INTEGER NOT NULL DEFAULT 1,
    "comprobante" TEXT NOT NULL,
    "estado" "EstadoComprobante" NOT NULL DEFAULT 'PENDIENTE',
    "motivoRechazo" TEXT,
    "aprobadoPorId" TEXT,
    "fechaAprobacion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_pago_torneoId_key" ON "configuraciones_pago"("torneoId");

-- AddForeignKey
ALTER TABLE "configuraciones_pago" ADD CONSTRAINT "configuraciones_pago_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_equipoId_fkey" FOREIGN KEY ("equipoId") REFERENCES "equipos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_torneoId_fkey" FOREIGN KEY ("torneoId") REFERENCES "torneos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pagos" ADD CONSTRAINT "pagos_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
