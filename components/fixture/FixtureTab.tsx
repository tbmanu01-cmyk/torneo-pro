"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import PartidoCard from "@/components/fixture/PartidoCard";
import GenerarFixtureModal, { type GenerateOpts } from "@/components/fixture/GenerarFixtureModal";
import EditarPartidoModal from "@/components/fixture/EditarPartidoModal";
import type { JornadaRow, PartidoRow, FormatoTorneo } from "@/types";

interface Props {
  torneoId:   string;
  formato:    FormatoTorneo;
  numEquipos: number;
  jornadas:   JornadaRow[];
  isAdmin:    boolean;
}

export default function FixtureTab({ torneoId, formato, numEquipos, jornadas: initial, isAdmin }: Props) {
  const router = useRouter();
  const [isPending,   startTransition]  = useTransition();
  const [isSaving,    setIsSaving]      = useState(false);
  const [showGenerar, setShowGenerar]   = useState(false);
  const [editPartido, setEditPartido]   = useState<PartidoRow | null>(null);
  const [openJornadas, setOpenJornadas] = useState<Set<string>>(() => {
    // Open first jornada by default
    const s = new Set<string>();
    if (initial.length > 0) s.add(initial[0].id);
    return s;
  });

  const hasFixture = initial.length > 0;

  const toggleJornada = (id: string) => {
    setOpenJornadas((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleGenerate = async (opts: GenerateOpts) => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/torneos/${torneoId}/fixture/generate`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(opts),
        });
        let data: { error?: string } = {};
        try { data = await res.json(); } catch { /* respuesta no-JSON */ }
        if (!res.ok) {
          toast.error(data.error ?? `Error del servidor (${res.status})`);
          return;
        }
        toast.success("Fixture generado correctamente");
        setShowGenerar(false);
        router.refresh();
      } catch (err) {
        console.error("[FixtureTab] handleGenerate:", err);
        toast.error("No se pudo conectar con el servidor");
      }
    });
  };

  const handleDeleteFixture = () => {
    if (!confirm("¿Eliminar todo el fixture? Esta acción no se puede deshacer.")) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/torneos/${torneoId}/fixture`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Error al eliminar"); return; }
        toast.success("Fixture eliminado");
        router.refresh();
      } catch {
        toast.error("Error de conexión");
      }
    });
  };

  const handleSavePartido = async (
    id: string,
    data: { fecha?: string; hora?: string; cancha?: string },
  ) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/partidos/${id}`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) { toast.error(result.error ?? "Error al guardar"); return; }
      toast.success("Partido actualizado");
      setEditPartido(null);
      router.refresh();
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {hasFixture
            ? `${initial.length} ${formato === "ELIMINACION_DIRECTA" ? "rondas" : "jornadas"} · ${initial.reduce((s, j) => s + j.partidos.length, 0)} partidos`
            : "No hay fixture generado"}
        </p>
        {isAdmin && (
          <div className="flex gap-2">
            {hasFixture && (
              <Button
                variant="outline"
                onClick={handleDeleteFixture}
                loading={isPending}
                className="text-red-600 border-red-200 hover:border-red-400"
              >
                🗑️ Eliminar
              </Button>
            )}
            <Button onClick={() => setShowGenerar(true)} loading={isPending}>
              {hasFixture ? "⟳ Regenerar" : "⚡ Generar Fixture"}
            </Button>
          </div>
        )}
      </div>

      {/* Empty state */}
      {!hasFixture && (
        <div className="py-20 text-center rounded-2xl bg-white border border-gray-100">
          <p className="text-5xl mb-4">📅</p>
          <p className="font-semibold text-gray-700 mb-1">No hay fixture generado</p>
          <p className="text-sm text-gray-400 mb-6">
            {numEquipos < 2
              ? "Agrega al menos 2 equipos para poder generar el fixture"
              : "El fixture se generará automáticamente según el formato del torneo"}
          </p>
          {isAdmin && numEquipos >= 2 && (
            <Button onClick={() => setShowGenerar(true)}>
              ⚡ Generar Fixture
            </Button>
          )}
        </div>
      )}

      {/* Fixture accordion */}
      {hasFixture && (
        <div className="space-y-3">
          {initial.map((jornada) => {
            const isOpen = openJornadas.has(jornada.id);
            return (
              <div
                key={jornada.id}
                className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
              >
                {/* Jornada header */}
                <button
                  onClick={() => toggleJornada(jornada.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{jornada.nombre}</span>
                    <StatusBadge value={jornada.estado} />
                    <span className="text-sm text-gray-400">
                      {jornada.partidos.length} partido{jornada.partidos.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {jornada.fecha && (
                      <span className="text-sm text-gray-500 hidden sm:block">
                        {new Date(jornada.fecha).toLocaleDateString("es-ES", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </span>
                    )}
                    <svg
                      className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Partidos list */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-2">
                    {jornada.partidos.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-4">Sin partidos programados</p>
                    ) : (
                      jornada.partidos.map((partido) => (
                        <PartidoCard
                          key={partido.id}
                          partido={partido}
                          isAdmin={isAdmin}
                          onEdit={setEditPartido}
                        />
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      <GenerarFixtureModal
        isOpen={showGenerar}
        onClose={() => setShowGenerar(false)}
        onGenerate={handleGenerate}
        isGenerating={isPending}
        formato={formato}
        numEquipos={numEquipos}
        hasExisting={hasFixture}
      />

      <EditarPartidoModal
        partido={editPartido}
        onClose={() => setEditPartido(null)}
        onSave={handleSavePartido}
        isSaving={isSaving}
      />
    </>
  );
}
