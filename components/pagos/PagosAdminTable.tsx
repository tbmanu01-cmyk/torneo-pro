"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import StatusBadge from "@/components/ui/StatusBadge";
import EstadoPagoBadge from "@/components/pagos/EstadoPagoBadge";
import RevisarPagoModal from "@/components/pagos/RevisarPagoModal";
import type { PagoRow } from "@/types";

type EquipoConPagos = {
  id:         string;
  nombre:     string;
  logo:       string | null;
  estadoPago: string;
  capitan:    { name: string; email: string } | null;
  pagos:      PagoRow[];
};

type PagoConEquipo = PagoRow & { equipo: { nombre: string; logo: string | null } };

interface Props {
  torneoId:       string;
  equipos:        EquipoConPagos[];
  hasPagosConfig: boolean;
  moneda?:        string;
}

type Filtro = "todos" | "pendientes" | "pagados" | "bloqueados";

export default function PagosAdminTable({ torneoId, equipos, hasPagosConfig, moneda = "COP" }: Props) {
  const router    = useRouter();
  const [filtro,  setFiltro]      = useState<Filtro>("todos");
  const [pagoSel, setPagoSel]     = useState<PagoConEquipo | null>(null);
  const [loading, setLoading]     = useState(false);

  const filtered = equipos.filter((eq) => {
    if (filtro === "pendientes") return eq.pagos.some((p) => p.estado === "PENDIENTE");
    if (filtro === "pagados")    return eq.estadoPago === "PAGADO";
    if (filtro === "bloqueados") return eq.estadoPago === "BLOQUEADO";
    return true;
  });

  const pendingCount = equipos.reduce(
    (acc, eq) => acc + eq.pagos.filter((p) => p.estado === "PENDIENTE").length,
    0,
  );

  async function handleAprobar(id: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pagos/${id}/aprobar`, { method: "PATCH" });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error);
      }
      toast.success("Pago aprobado");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al aprobar");
    } finally {
      setLoading(false);
    }
  }

  async function handleRechazar(id: string, motivo: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/pagos/${id}/rechazar`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ motivoRechazo: motivo }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error);
      }
      toast.success("Pago rechazado");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al rechazar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Warning sin configuracion */}
      {!hasPagosConfig && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 p-4">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-medium text-amber-800">Configuración de pago pendiente</p>
            <p className="text-sm text-amber-600 mt-0.5">
              Los equipos no podrán ver los datos bancarios ni subir comprobantes hasta que configures el pago.
            </p>
          </div>
        </div>
      )}

      {/* Tabs filtro */}
      <div className="mb-4 flex gap-1 rounded-xl bg-gray-100 p-1 w-fit">
        {(
          [
            { key: "todos",      label: "Todos" },
            { key: "pendientes", label: `Pendientes${pendingCount > 0 ? ` (${pendingCount})` : ""}` },
            { key: "pagados",    label: "Pagados" },
            { key: "bloqueados", label: "Bloqueados" },
          ] as { key: Filtro; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFiltro(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filtro === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-gray-500 text-sm">No hay equipos en esta categoría</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Equipo</th>
                  <th className="px-4 py-3 text-left">Capitán</th>
                  <th className="px-4 py-3 text-left">Estado pago</th>
                  <th className="px-4 py-3 text-left">Comprobantes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((equipo, idx) => (
                  <tr key={equipo.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4 text-gray-400 tabular-nums">{idx + 1}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {equipo.logo ? (
                          <img src={equipo.logo} alt={equipo.nombre} className="h-9 w-9 rounded-xl object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-bold">
                            {equipo.nombre.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{equipo.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {equipo.capitan ? (
                        <div>
                          <p className="font-medium text-gray-700">{equipo.capitan.name}</p>
                          <p className="text-xs text-gray-400">{equipo.capitan.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge value={equipo.estadoPago} />
                    </td>
                    <td className="px-4 py-4">
                      {equipo.pagos.length === 0 ? (
                        <span className="text-gray-400 text-xs">Sin comprobantes</span>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {equipo.pagos.map((pago) => (
                            <div key={pago.id} className="flex items-center gap-2">
                              <span className="text-xs text-gray-500">
                                Cuota {pago.numeroCuota}
                              </span>
                              <EstadoPagoBadge estado={pago.estado} />
                              <button
                                onClick={() =>
                                  setPagoSel({
                                    ...pago,
                                    equipo: {
                                      id:     equipo.id,
                                      nombre: equipo.nombre,
                                      logo:   equipo.logo,
                                    },
                                  })
                                }
                                className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                Ver
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal revisar */}
      <RevisarPagoModal
        pago={pagoSel}
        onClose={() => setPagoSel(null)}
        onAprobar={handleAprobar}
        onRechazar={handleRechazar}
        isLoading={loading}
        moneda={moneda}
      />
    </>
  );
}
