"use client";

import { useState } from "react";
import type { ConfiguracionPagoRow } from "@/types";

interface Props {
  config: ConfiguracionPagoRow;
}

function fmt(amount: number, moneda: string) {
  return new Intl.NumberFormat("es-VE", {
    style:    "currency",
    currency: moneda,
    minimumFractionDigits: 2,
  }).format(amount);
}

function fmtDate(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

type CopiedKey = "telefono" | "cedula" | "todos" | null;

export default function DatosPagoCard({ config }: Props) {
  const [copied, setCopied] = useState<CopiedKey>(null);
  const pm = config.datosPagoMovil;

  function copy(key: CopiedKey, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  function copyAll() {
    const text = `Banco: ${pm.banco}\nTeléfono: ${pm.telefono}\nCédula: ${pm.cedula}\nTitular: ${pm.titular}`;
    copy("todos", text);
  }

  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4">
        <h2 className="text-base font-semibold text-white">Datos de Pago Móvil</h2>
        <p className="text-xs text-green-100 mt-0.5">
          Realiza tu pago móvil y sube el comprobante
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Montos */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Valor de inscripción
          </h3>
          {!config.permiteCuotas ? (
            <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">
                {fmt(config.montoInscripcion, config.moneda)}
              </p>
              <p className="text-xs text-green-600 mt-1">Pago único</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-700">1ª Cuota</p>
                    <p className="text-xl font-bold text-blue-800">
                      {fmt(config.montoPrimeraCuota ?? config.montoInscripcion, config.moneda)}
                    </p>
                  </div>
                  {config.fechaLimitePrimeraCuota && (
                    <div className="text-right">
                      <p className="text-xs text-blue-500">Vence</p>
                      <p className="text-xs font-medium text-blue-700">
                        {fmtDate(config.fechaLimitePrimeraCuota)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {config.numeroCuotas === 2 && (
                <div className="rounded-xl bg-purple-50 border border-purple-100 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-purple-700">2ª Cuota</p>
                      <p className="text-xl font-bold text-purple-800">
                        {fmt(config.montoSegundaCuota ?? config.montoInscripcion, config.moneda)}
                      </p>
                    </div>
                    {config.fechaLimiteSegundaCuota && (
                      <div className="text-right">
                        <p className="text-xs text-purple-500">Vence</p>
                        <p className="text-xs font-medium text-purple-700">
                          {fmtDate(config.fechaLimiteSegundaCuota)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Datos Pago Móvil */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Datos Pago Móvil
            </h3>
            <button
              onClick={copyAll}
              className="flex items-center gap-1.5 rounded-lg bg-green-50 border border-green-100 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100 transition-colors"
            >
              {copied === "todos" ? (
                <>✓ Copiado</>
              ) : (
                <>
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                  Copiar todo
                </>
              )}
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100">
            <Row label="Banco" value={pm.banco} />
            <CopyRow
              label="Teléfono"
              value={pm.telefono}
              copied={copied === "telefono"}
              onCopy={() => copy("telefono", pm.telefono)}
            />
            <CopyRow
              label="Cédula"
              value={pm.cedula}
              copied={copied === "cedula"}
              onCopy={() => copy("cedula", pm.cedula)}
            />
            <Row label="Titular" value={pm.titular} />
          </div>
        </div>

        {/* Instrucciones */}
        {config.instrucciones && (
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
              Instrucciones
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap rounded-xl bg-amber-50 border border-amber-100 p-4">
              {config.instrucciones}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

function CopyRow({
  label, value, copied, onCopy,
}: { label: string; value: string; copied: boolean; onCopy: () => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-xs text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-800 font-mono">{value}</span>
        <button
          onClick={onCopy}
          title={`Copiar ${label.toLowerCase()}`}
          className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-green-600 transition-colors"
        >
          {copied ? (
            <span className="text-xs text-green-600 font-medium">✓</span>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
