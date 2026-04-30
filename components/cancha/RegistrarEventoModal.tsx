"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export type TipoEvento = "GOL" | "TARJETA_AMARILLA" | "TARJETA_ROJA";

export type JugadorSimple = {
  id:            string;
  nombre:        string;
  numeroJugador: number;
  equipoId:      string;
  equipoNombre:  string;
};

export type EventoModalState =
  | { open: false }
  | { open: true; tipo: TipoEvento; jugador: JugadorSimple; equipoId: string };

interface Props {
  state:        EventoModalState;
  todosJugadores: JugadorSimple[];
  onClose:      () => void;
  onSubmit:     (data: { tipo: TipoEvento; jugadorId: string; equipoId: string; minuto: number; asistenciaJugadorId?: string; notas?: string }) => void;
  isLoading:    boolean;
}

const TIPO_LABEL: Record<TipoEvento, string> = {
  GOL:             "⚽ Registrar Gol",
  TARJETA_AMARILLA: "🟨 Tarjeta Amarilla",
  TARJETA_ROJA:    "🟥 Tarjeta Roja",
};

const TIPO_COLOR: Record<TipoEvento, string> = {
  GOL:             "text-green-400",
  TARJETA_AMARILLA: "text-yellow-400",
  TARJETA_ROJA:    "text-red-400",
};

export default function RegistrarEventoModal({ state, todosJugadores, onClose, onSubmit, isLoading }: Props) {
  const [minuto,              setMinuto]              = useState(0);
  const [notas,               setNotas]               = useState("");
  const [asistenciaJugadorId, setAsistenciaJugadorId] = useState("");

  if (!state.open) return null;

  const { tipo, jugador, equipoId } = state;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      tipo,
      jugadorId: jugador.id,
      equipoId,
      minuto,
      asistenciaJugadorId: asistenciaJugadorId || undefined,
      notas:               notas               || undefined,
    });
    setMinuto(0);
    setNotas("");
    setAsistenciaJugadorId("");
  };

  const jugadoresParaAsistencia = todosJugadores.filter((j) => j.id !== jugador.id);

  return (
    <Modal isOpen onClose={onClose} title={TIPO_LABEL[tipo]}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Jugador */}
        <div className="flex items-center gap-3 rounded-xl bg-gray-800 px-4 py-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-700 text-sm font-bold text-white">
            #{jugador.numeroJugador}
          </div>
          <div>
            <p className={`font-semibold ${TIPO_COLOR[tipo]}`}>{jugador.nombre}</p>
            <p className="text-xs text-gray-400">{jugador.equipoNombre}</p>
          </div>
        </div>

        {/* Minuto */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Minuto
          </label>
          <input
            type="number"
            min={0}
            max={120}
            value={minuto}
            onChange={(e) => setMinuto(Number(e.target.value))}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
          />
        </div>

        {/* Asistencia (solo para goles) */}
        {tipo === "GOL" && (
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-300">
              Asistencia <span className="text-gray-500 font-normal">(opcional)</span>
            </label>
            <select
              value={asistenciaJugadorId}
              onChange={(e) => setAsistenciaJugadorId(e.target.value)}
              className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="">— Sin asistencia —</option>
              {jugadoresParaAsistencia.map((j) => (
                <option key={j.id} value={j.id}>
                  #{j.numeroJugador} {j.nombre} ({j.equipoNombre})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">
            Notas <span className="text-gray-500 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            placeholder={tipo === "GOL" ? "ej: Penal, Autogol…" : "ej: Falta, Protestar…"}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-gray-600 text-gray-300 hover:border-gray-400">
            Cancelar
          </Button>
          <Button type="submit" loading={isLoading} className="flex-1">
            Confirmar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
