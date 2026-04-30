"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import DatosPagoCard from "@/components/pagos/DatosPagoCard";
import EstadoPagoBadge from "@/components/pagos/EstadoPagoBadge";
import SubirComprobanteModal from "@/components/pagos/SubirComprobanteModal";
import type { PagoRow, ConfiguracionPagoRow } from "@/types";

interface Props {
  equipoId:   string;
  estadoPago: string;
  config:     ConfiguracionPagoRow | null;
  pagos:      PagoRow[];
}

const ESTADO_BANNER: Record<string, { label: string; className: string; icon: string }> = {
  PENDIENTE: { label: "Inscripción pendiente de pago",               className: "bg-yellow-50 border-yellow-200 text-yellow-800",  icon: "⏳" },
  PARCIAL:   { label: "Primera cuota pagada — pendiente segunda cuota", className: "bg-orange-50 border-orange-200 text-orange-800", icon: "⏳" },
  PAGADO:    { label: "Inscripción completamente pagada",             className: "bg-green-50 border-green-200 text-green-800",     icon: "✅" },
  BLOQUEADO: { label: "Equipo bloqueado por falta de pago",          className: "bg-red-50 border-red-200 text-red-800",           icon: "🚫" },
};

function fmt(amount: number, moneda: string) {
  return new Intl.NumberFormat("es-CO", {
    style:    "currency",
    currency: moneda,
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function PagosCapitanView({ equipoId, estadoPago, config, pagos }: Props) {
  const router  = useRouter();
  const [modalOpen,    setModalOpen]    = useState(false);
  const [cuotaActual,  setCuotaActual]  = useState(1);
  const [montoActual,  setMontoActual]  = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const banner = ESTADO_BANNER[estadoPago] ?? ESTADO_BANNER.PENDIENTE;

  // Determine cuota status
  const cuota1 = pagos.filter((p) => p.numeroCuota === 1)[0];
  const cuota2 = pagos.filter((p) => p.numeroCuota === 2)[0];

  function canSubirCuota(pagoActual: PagoRow | undefined): boolean {
    if (!pagoActual) return true;
    return pagoActual.estado === "RECHAZADO";
  }

  function openModal(cuota: number) {
    if (!config) return;
    let monto = config.montoInscripcion;
    if (config.permiteCuotas) {
      if (cuota === 1 && config.montoPrimeraCuota) monto = config.montoPrimeraCuota;
      if (cuota === 2 && config.montoSegundaCuota) monto = config.montoSegundaCuota;
    }
    setCuotaActual(cuota);
    setMontoActual(monto);
    setModalOpen(true);
  }

  async function handleSubirComprobante(data: {
    monto: number;
    numeroCuota: number;
    comprobante: string;
    numeroReferencia?: string;
  }) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/equipos/${equipoId}/pagos`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al enviar");
      toast.success("Comprobante enviado. Espera la revisión del organizador.");
      setModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al enviar");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {/* Banner estado */}
      <div className={`mb-6 flex items-center gap-3 rounded-2xl border p-4 ${banner.className}`}>
        <span className="text-2xl">{banner.icon}</span>
        <p className="font-medium">{banner.label}</p>
      </div>

      {!config ? (
        /* Sin configuración */
        <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-12 text-center">
          <p className="text-4xl mb-3">⏳</p>
          <p className="font-medium text-gray-700">
            El organizador aún no ha configurado los datos de pago
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Vuelve más tarde para ver los datos bancarios y subir tu comprobante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Datos bancarios */}
          <DatosPagoCard config={config} />

          {/* Estado de cuotas y comprobantes */}
          <div className="space-y-4">
            <h2 className="font-semibold text-gray-900">Mis comprobantes</h2>

            {!config.permiteCuotas ? (
              /* Pago único */
              <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Pago único</p>
                    <p className="text-xl font-bold text-gray-900 mt-0.5">
                      {fmt(config.montoInscripcion, config.moneda)}
                    </p>
                  </div>
                  {cuota1 ? (
                    <EstadoPagoBadge estado={cuota1.estado} />
                  ) : (
                    <span className="text-xs text-gray-400">Sin comprobante</span>
                  )}
                </div>

                {cuota1?.estado === "RECHAZADO" && cuota1.motivoRechazo && (
                  <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                    <p className="text-xs font-medium text-red-700">Motivo de rechazo:</p>
                    <p className="text-xs text-red-600 mt-0.5">{cuota1.motivoRechazo}</p>
                  </div>
                )}

                {canSubirCuota(cuota1) && estadoPago !== "PAGADO" && (
                  <button
                    onClick={() => openModal(1)}
                    className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                  >
                    {cuota1 ? "Subir nueva versión" : "Subir comprobante"}
                  </button>
                )}
              </div>
            ) : (
              /* Cuotas */
              <div className="space-y-3">
                {/* Cuota 1 */}
                <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700">1ª Cuota</p>
                      <p className="text-lg font-bold text-gray-900 mt-0.5">
                        {fmt(
                          config.montoPrimeraCuota ?? config.montoInscripcion,
                          config.moneda,
                        )}
                      </p>
                      {config.fechaLimitePrimeraCuota && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Vence:{" "}
                          {new Date(config.fechaLimitePrimeraCuota).toLocaleDateString("es-ES")}
                        </p>
                      )}
                    </div>
                    {cuota1 ? (
                      <EstadoPagoBadge estado={cuota1.estado} />
                    ) : (
                      <span className="text-xs text-gray-400">Sin comprobante</span>
                    )}
                  </div>
                  {cuota1?.estado === "RECHAZADO" && cuota1.motivoRechazo && (
                    <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                      <p className="text-xs font-medium text-red-700">Motivo de rechazo:</p>
                      <p className="text-xs text-red-600 mt-0.5">{cuota1.motivoRechazo}</p>
                    </div>
                  )}
                  {canSubirCuota(cuota1) && cuota1?.estado !== "APROBADO" && (
                    <button
                      onClick={() => openModal(1)}
                      className="w-full rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      {cuota1 ? "Subir nueva versión" : "Subir comprobante"}
                    </button>
                  )}
                </div>

                {/* Cuota 2 */}
                {config.numeroCuotas === 2 && (
                  <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-700">2ª Cuota</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                          {fmt(
                            config.montoSegundaCuota ?? config.montoInscripcion,
                            config.moneda,
                          )}
                        </p>
                        {config.fechaLimiteSegundaCuota && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            Vence:{" "}
                            {new Date(config.fechaLimiteSegundaCuota).toLocaleDateString("es-ES")}
                          </p>
                        )}
                      </div>
                      {cuota2 ? (
                        <EstadoPagoBadge estado={cuota2.estado} />
                      ) : (
                        <span className="text-xs text-gray-400">Sin comprobante</span>
                      )}
                    </div>
                    {cuota2?.estado === "RECHAZADO" && cuota2.motivoRechazo && (
                      <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                        <p className="text-xs font-medium text-red-700">Motivo de rechazo:</p>
                        <p className="text-xs text-red-600 mt-0.5">{cuota2.motivoRechazo}</p>
                      </div>
                    )}
                    {/* Can only submit cuota 2 if cuota 1 is approved */}
                    {cuota1?.estado === "APROBADO" && canSubirCuota(cuota2) && cuota2?.estado !== "APROBADO" && (
                      <button
                        onClick={() => openModal(2)}
                        className="w-full rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                      >
                        {cuota2 ? "Subir nueva versión" : "Subir comprobante"}
                      </button>
                    )}
                    {(!cuota1 || cuota1.estado !== "APROBADO") && !cuota2 && (
                      <p className="text-xs text-gray-400 text-center py-1">
                        Disponible tras aprobar la 1ª cuota
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <SubirComprobanteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubirComprobante}
        numeroCuota={cuotaActual}
        monto={montoActual}
        moneda={config?.moneda ?? "COP"}
        isLoading={isSubmitting}
      />
    </>
  );
}
