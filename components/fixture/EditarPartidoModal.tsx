"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { PartidoRow } from "@/types";

interface Props {
  partido:   PartidoRow | null;
  onClose:   () => void;
  onSave:    (id: string, data: { fecha?: string; hora?: string; cancha?: string }) => Promise<void>;
  isSaving:  boolean;
}

export default function EditarPartidoModal({ partido, onClose, onSave, isSaving }: Props) {
  const [fecha,  setFecha]  = useState(
    partido?.fecha ? new Date(partido.fecha).toISOString().split("T")[0] : "",
  );
  const [hora,   setHora]   = useState(partido?.hora   ?? "");
  const [cancha, setCancha] = useState(partido?.cancha ?? "");

  if (!partido) return null;

  const local     = partido.equipoLocal?.nombre     ?? "Por definir";
  const visitante = partido.equipoVisitante?.nombre ?? "Por definir";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(partido.id, {
      fecha:  fecha  || undefined,
      hora:   hora   || undefined,
      cancha: cancha || undefined,
    });
  };

  return (
    <Modal isOpen={!!partido} onClose={onClose} title="Editar Partido">
      <p className="mb-4 text-sm font-medium text-gray-700 text-center">
        {local} <span className="text-gray-400">vs</span> {visitante}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha
          </label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora
          </label>
          <input
            type="time"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Cancha
          </label>
          <input
            type="text"
            value={cancha}
            onChange={(e) => setCancha(e.target.value)}
            placeholder="Ej: Cancha principal, Estadio Municipal..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button type="submit" loading={isSaving} className="flex-1">
            Guardar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
