/*
  Warnings:

  - You are about to drop the column `datosBancarios` on the `configuraciones_pago` table. All the data in the column will be lost.
  - Added the required column `datosPagoMovil` to the `configuraciones_pago` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "EstadoPago" ADD VALUE 'PARCIAL';

-- AlterTable
ALTER TABLE "configuraciones_pago" DROP COLUMN "datosBancarios",
ADD COLUMN     "datosPagoMovil" JSONB NOT NULL,
ALTER COLUMN "moneda" SET DEFAULT 'VES';

-- AlterTable
ALTER TABLE "pagos" ADD COLUMN     "numeroReferencia" TEXT;
