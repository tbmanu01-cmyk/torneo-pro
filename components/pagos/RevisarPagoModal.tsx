"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import EstadoPagoBadge from "@/components/pagos/EstadoPagoBadge";
import type { PagoRow } from "@/types";

type PagoConEquipo = PagoRow & { equipo: { nombre: string; logo: string | null } };

interface Props {
  pago:       PagoConEquipo | null;
  onClose:    () => void;
  onAprobar:  (id: string) => Promise<void>;
  onRechazar: (id: string, motivo: string) => Promise<void>;
  isLoading:  boolean;
  moneda?:    string;
}

export default function RevisarPagoModal({
  pago, onClose, onAprobar, onRechazar, isLoading, moneda = "COP",
}: Props) {
  const [showRechazo,    setShowRechazo]    = useState(false);
  const [motivoRechazo,  setMotivoRechazo]  = useState("");

  if (!pago) return null;

  const isPdf        = pago.comprobante.includes("/raw/") || pago.comprobante.endsWith(".pdf");
  const isFinalizado = pago.estado === "APROBADO" || pago.estado === "RECHAZADO";
  const cuotaLabel   = pago.numeroCuota === 1 ? "1ª Cuota" : "2ª Cuota";

  function handleClose() {
    setShowRechazo(false);
    setMotivoRechazo("");
    onClose();
  }

  async function handleAprobar() {
    await onAprobar(pago!.id);
    handleClose();
  }

  async function handleRechazar() {
    if (!motivoRechazo.trim()) return;
    await onRechazar(pago!.id, motivoRechazo.trim());
    handleClose();
  }

  return (
    <Modal isOpen={!!pago} onClose={handleClose} title="Revisar comprobante" size="lg">
      <div className="space-y-5">
        {/* Info del pago */}
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 space-y-2">
          <div className="flex items-center gap-3">
            {pago.equipo.logo ? (
              <img src={pago.equipo.logo} alt={pago.equipo.nombre} className="h-10 w-10 rounded-xl object-cover" />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold">
                {pago.equipo.nombre.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">{pago.equipo.nombre}</p>
              <p className="text-xs text-gray-500">{cuotaLabel}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs text-gray-400">Monto</p>
              <p className="font-bold text-gray-800">
                {new Intl.NumberFormat("es-CO", { style: "currency", currency: moneda, minimumFractionDigits: 0 }).format(pago.monto)}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-2">
            <span>Enviado: {new Date(pago.createdAt).toLocaleDateString("es-ES")}</span>
            <EstadoPagoBadge estado={pago.estado} />
          </div>
          {pago.numeroReferencia && (
            <div className="flex items-center justify-between text-xs border-t border-gray-100 pt-2">
              <span className="text-gray-500">N° de referencia</span>
              <span className="font-mono font-semibold text-gray-800">{pago.numeroReferencia}</span>
            </div>
          )}
          {pago.estado === "RECHAZADO" && pago.motivoRechazo && (
            <div className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs text-red-700">
              <span className="font-medium">Motivo de rechazo:</span> {pago.motivoRechazo}
            </div>
          )}
          {pago.estado === "APROBADO" && pago.aprobadoPor && (
            <div className="rounded-lg bg-green-50 border border-green-100 px-3 py-2 text-xs text-green-700">
              Aprobado por <span className="font-medium">{pago.aprobadoPor.name}</span>
              {pago.fechaAprobacion && (
                <> el {new Date(pago.fechaAprobacion).toLocaleDateString("es-ES")}</>
              )}
            </div>
          )}
        </div>

        {/* Comprobante */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
            Comprobante
          </p>
          {isPdf ? (
            <a
              href={pago.comprobante}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:border-green-400 hover:bg-green-50 transition-colors group"
            >
              <span className="text-3xl">📄</span>
              <div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                  Ver comprobante PDF
                </p>
                <p className="text-xs text-gray-400">Abre en nueva pestaña</p>
              </div>
              <svg className="ml-auto h-4 w-4 text-gray-400 group-hover:text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          ) : (
            <a href={pago.comprobante} target="_blank" rel="noopener noreferrer">
              <img
                src={pago.comprobante}
                alt="Comprobante de pago"
                className="w-full max-h-72 rounded-xl object-contain border border-gray-200 hover:border-green-400 transition-colors cursor-zoom-in"
              />
            </a>
          )}
        </div>

        {/* Actions */}
        {!isFinalizado && (
          <div className="space-y-3">
            {showRechazo ? (
              <div className="space-y-3">
                <textarea
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  placeholder="Escribe el motivo del rechazo..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 p-3 text-sm focus:border-red-400 focus:outline-none focus:ring-1 focus:ring-red-300 resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => { setShowRechazo(false); setMotivoRechazo(""); }}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRechazar}
                    disabled={!motivoRechazo.trim() || isLoading}
                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
                  >
                    {isLoading ? "Rechazando..." : "Confirmar rechazo"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRechazo(true)}
                  disabled={isLoading}
                  className="flex-1 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-40 transition-colors"
                >
                  Rechazar
                </button>
                <button
                  onClick={handleAprobar}
                  disabled={isLoading}
                  className="flex-1 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-40 transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Aprobando...
                    </span>
                  ) : (
                    "Aprobar"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
