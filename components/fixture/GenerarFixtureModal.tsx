"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { getFixturePreview } from "@/lib/fixture-generator";
import type { FormatoTorneo } from "@/types";

interface Props {
  isOpen:           boolean;
  onClose:          () => void;
  onGenerate:       (opts: GenerateOpts) => Promise<void>;
  isGenerating:     boolean;
  formato:          FormatoTorneo;
  numEquipos:       number;
  hasExisting:      boolean;
}

export interface GenerateOpts {
  fechaInicio:        string;
  diasEntreJornadas:  number;
  horaDefault:        string;
  shuffle:            boolean;
  confirmarRegenerar: boolean;
}

export default function GenerarFixtureModal({
  isOpen, onClose, onGenerate, isGenerating, formato, numEquipos, hasExisting,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  const [fechaInicio,       setFechaInicio]       = useState(today);
  const [diasEntreJornadas, setDiasEntreJornadas] = useState(7);
  const [horaDefault,       setHoraDefault]       = useState("15:00");
  const [shuffle,           setShuffle]           = useState(false);
  const [confirmar,         setConfirmar]         = useState(false);

  const preview = getFixturePreview(formato, numEquipos);

  const formatoLabel: Record<FormatoTorneo, string> = {
    LIGA:                "Liga (todos contra todos)",
    IDA_VUELTA:          "Liga Ida y Vuelta",
    ELIMINACION_DIRECTA: "Eliminación Directa",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaInicio) return;
    await onGenerate({
      fechaInicio,
      diasEntreJornadas,
      horaDefault,
      shuffle,
      confirmarRegenerar: confirmar,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Generar Fixture" size="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Formato info */}
        <div className="rounded-lg bg-green-50 border border-green-100 p-3 text-sm text-green-800">
          <span className="font-medium">Formato:</span> {formatoLabel[formato]}
          {" · "}
          <span className="font-medium">{numEquipos} equipos</span>
        </div>

        {/* Preview */}
        {preview && (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{preview.jornadas}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formato === "ELIMINACION_DIRECTA" ? "Rondas" : "Jornadas"}
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{preview.totalPartidos}</p>
              <p className="text-xs text-gray-500 mt-0.5">Partidos totales</p>
            </div>
          </div>
        )}

        {/* Fecha inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de inicio <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Días entre jornadas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Días entre jornadas
          </label>
          <input
            type="number"
            min={1}
            max={60}
            value={diasEntreJornadas}
            onChange={(e) => setDiasEntreJornadas(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Hora por defecto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora por defecto
          </label>
          <input
            type="time"
            value={horaDefault}
            onChange={(e) => setHoraDefault(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Shuffle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={shuffle}
            onChange={(e) => setShuffle(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">
            Aleatorizar emparejamientos
          </span>
        </label>

        {/* Advertencia regenerar */}
        {hasExisting && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 space-y-2">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ Ya existe un fixture. Si continúas se eliminará y se creará uno nuevo.
            </p>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmar}
                onChange={(e) => setConfirmar(e.target.checked)}
                className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
              />
              <span className="text-sm text-amber-700">
                Confirmo que quiero regenerar el fixture
              </span>
            </label>
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isGenerating}
            disabled={hasExisting && !confirmar}
            className="flex-1"
          >
            {hasExisting ? "Regenerar Fixture" : "Generar Fixture"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
