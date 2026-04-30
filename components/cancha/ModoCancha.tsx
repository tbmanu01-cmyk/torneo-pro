"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import RegistrarEventoModal, { type EventoModalState, type TipoEvento, type JugadorSimple } from "./RegistrarEventoModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JugadorCanchaRow = {
  id:                string;
  nombre:            string;
  numeroJugador:     number;
  goles:             number;
  asistencias:       number;
  tarjetasAmarillas: number;
  tarjetasRojas:     number;
  suspendido:        boolean;
};

export type EquipoCanchaRow = {
  id:         string;
  nombre:     string;
  logo:       string | null;
  estadoPago: string;
  jugadores:  JugadorCanchaRow[];
};

export type EventoCanchaRow = {
  id:                  string;
  tipo:                "GOL" | "TARJETA_AMARILLA" | "TARJETA_ROJA" | "CAMBIO";
  minuto:              number;
  notas:               string | null;
  jugadorId:           string;
  jugador:             { id: string; nombre: string; numeroJugador: number };
  equipoId:            string;
  equipo:              { id: string; nombre: string };
  asistenciaJugadorId: string | null;
  asistenciaJugador:   { id: string; nombre: string } | null;
};

export type PartidoCanchaRow = {
  id:                string;
  estado:            "PENDIENTE" | "EN_CURSO" | "FINALIZADO" | "SUSPENDIDO";
  actaCerrada:       boolean;
  golesLocal:        number;
  golesVisitante:    number;
  fecha:             Date | null;
  hora:              string | null;
  cancha:            string | null;
  equipoLocal:       EquipoCanchaRow | null;
  equipoVisitante:   EquipoCanchaRow | null;
  eventos:           EventoCanchaRow[];
  jornada: {
    id:      string;
    numero:  number;
    nombre:  string;
    torneo:  { id: string; nombre: string };
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE:  "bg-gray-700 text-gray-300",
  EN_CURSO:   "bg-green-600 text-white animate-pulse",
  FINALIZADO: "bg-blue-700 text-white",
  SUSPENDIDO: "bg-red-700 text-white",
};

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE:  "Pendiente",
  EN_CURSO:   "En Curso",
  FINALIZADO: "Finalizado",
  SUSPENDIDO: "Suspendido",
};

const EVENTO_ICON: Record<string, string> = {
  GOL:             "⚽",
  TARJETA_AMARILLA: "🟨",
  TARJETA_ROJA:    "🟥",
  CAMBIO:          "🔄",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function TeamLogo({ nombre, logo }: { nombre: string; logo: string | null }) {
  return (
    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
      {logo
        ? <img src={logo} alt={nombre} className="h-full w-full object-cover" />
        : <span className="text-lg font-bold text-white">{nombre.charAt(0)}</span>
      }
    </div>
  );
}

function PlayerRow({
  jugador,
  onAction,
  locked,
}: {
  jugador:  JugadorCanchaRow;
  onAction: (tipo: TipoEvento) => void;
  locked:   boolean;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 transition-colors ${
      jugador.suspendido ? "bg-red-950/40 border border-red-800/40" : "bg-gray-800/60 border border-gray-700/40"
    }`}>
      {/* Número + nombre */}
      <span className="w-7 flex-shrink-0 text-center text-xs font-bold text-gray-400">
        #{jugador.numeroJugador}
      </span>
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-white leading-tight">
          {jugador.nombre}
          {jugador.suspendido && (
            <span className="ml-1 text-xs text-red-400 font-normal">⛔</span>
          )}
        </p>
        {/* Mini stats */}
        <div className="flex items-center gap-2 mt-0.5">
          {jugador.goles > 0 && (
            <span className="text-xs text-gray-400">⚽ {jugador.goles}</span>
          )}
          {jugador.tarjetasAmarillas > 0 && (
            <span className="text-xs text-yellow-500">🟨 {jugador.tarjetasAmarillas}</span>
          )}
          {jugador.tarjetasRojas > 0 && (
            <span className="text-xs text-red-500">🟥 {jugador.tarjetasRojas}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {!locked && (
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => onAction("GOL")}
            title="Registrar gol"
            className="rounded-lg bg-gray-700 px-2 py-1.5 text-sm hover:bg-green-700 active:scale-95 transition-all"
          >
            ⚽
          </button>
          <button
            onClick={() => onAction("TARJETA_AMARILLA")}
            title="Tarjeta amarilla"
            className="rounded-lg bg-gray-700 px-2 py-1.5 text-sm hover:bg-yellow-700 active:scale-95 transition-all"
          >
            🟨
          </button>
          <button
            onClick={() => onAction("TARJETA_ROJA")}
            title="Tarjeta roja"
            className="rounded-lg bg-gray-700 px-2 py-1.5 text-sm hover:bg-red-700 active:scale-95 transition-all"
          >
            🟥
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  partido:  PartidoCanchaRow;
  isAdmin:  boolean;
}

export default function ModoCancha({ partido, isAdmin }: Props) {
  const router   = useRouter();
  const [isPending, startTransition] = useTransition();

  const [eventoModal,    setEventoModal]    = useState<EventoModalState>({ open: false });
  const [showMarcador,   setShowMarcador]   = useState(false);
  const [golesLEdit,     setGolesLEdit]     = useState(partido.golesLocal);
  const [golesVEdit,     setGolesVEdit]     = useState(partido.golesVisitante);
  const [confirmCerrar,  setConfirmCerrar]  = useState(false);

  const locked = partido.actaCerrada || !isAdmin;
  const canStart = partido.estado === "PENDIENTE" && isAdmin && !partido.actaCerrada;
  const canClose = partido.estado !== "PENDIENTE" && !partido.actaCerrada && isAdmin;

  // Build JugadorSimple list for assist dropdown
  const todosJugadores: JugadorSimple[] = [
    ...(partido.equipoLocal?.jugadores ?? []).map((j) => ({
      ...j, equipoId: partido.equipoLocal!.id, equipoNombre: partido.equipoLocal!.nombre,
    })),
    ...(partido.equipoVisitante?.jugadores ?? []).map((j) => ({
      ...j, equipoId: partido.equipoVisitante!.id, equipoNombre: partido.equipoVisitante!.nombre,
    })),
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const apiCall = async (url: string, method: string, body?: object) => {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    let data: { error?: string } = {};
    try { data = await res.json(); } catch { /* html error */ }
    return { ok: res.ok, status: res.status, data };
  };

  const handleIniciar = () => {
    startTransition(async () => {
      const { ok, data } = await apiCall(`/api/partidos/${partido.id}/iniciar`, "POST");
      if (!ok) { toast.error(data.error ?? "Error al iniciar"); return; }
      toast.success("Partido iniciado");
      router.refresh();
    });
  };

  const handleCerrarActa = () => {
    startTransition(async () => {
      const { ok, data } = await apiCall(`/api/partidos/${partido.id}/cerrar-acta`, "POST");
      if (!ok) { toast.error(data.error ?? "Error al cerrar el acta"); return; }
      toast.success("Acta cerrada");
      setConfirmCerrar(false);
      router.refresh();
    });
  };

  const handleSubmitEvento = (payload: Parameters<typeof RegistrarEventoModal>[0]["onSubmit"] extends (d: infer D) => void ? D : never) => {
    startTransition(async () => {
      const { ok, data } = await apiCall(`/api/partidos/${partido.id}/eventos`, "POST", payload);
      if (!ok) { toast.error(data.error ?? "Error al registrar"); return; }
      toast.success("Evento registrado");
      setEventoModal({ open: false });
      router.refresh();
    });
  };

  const handleDeleteEvento = (eventoId: string) => {
    if (!confirm("¿Eliminar este evento?")) return;
    startTransition(async () => {
      const { ok, data } = await apiCall(`/api/partidos/${partido.id}/eventos/${eventoId}`, "DELETE");
      if (!ok) { toast.error(data.error ?? "Error al eliminar"); return; }
      toast.success("Evento eliminado");
      router.refresh();
    });
  };

  const handleSaveMarcador = () => {
    startTransition(async () => {
      const { ok, data } = await apiCall(`/api/partidos/${partido.id}/marcador`, "PATCH", {
        golesLocal: golesLEdit,
        golesVisitante: golesVEdit,
      });
      if (!ok) { toast.error(data.error ?? "Error al actualizar"); return; }
      toast.success("Marcador actualizado");
      setShowMarcador(false);
      router.refresh();
    });
  };

  const openEvento = (tipo: TipoEvento, jugador: JugadorCanchaRow, equipoId: string, equipoNombre: string) => {
    setEventoModal({
      open: true,
      tipo,
      jugador: { ...jugador, equipoId, equipoNombre },
      equipoId,
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-gray-800 bg-gray-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link
            href={`/torneos/${partido.jornada.torneo.id}?tab=calendario`}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Calendario
          </Link>
          <div className="text-center">
            <p className="text-xs text-gray-500">{partido.jornada.torneo.nombre}</p>
            <p className="text-sm font-semibold text-gray-200">{partido.jornada.nombre}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ESTADO_COLOR[partido.estado]}`}>
            {ESTADO_LABEL[partido.estado]}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 space-y-6">

        {/* ── Scoreboard ── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
          <div className="flex items-center justify-between gap-4">
            {/* Local */}
            <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
              <TeamLogo nombre={partido.equipoLocal?.nombre ?? "?"} logo={partido.equipoLocal?.logo ?? null} />
              <p className="text-center text-sm font-semibold text-white leading-tight line-clamp-2">
                {partido.equipoLocal?.nombre ?? "Por definir"}
              </p>
            </div>

            {/* Score */}
            <div className="flex-shrink-0 text-center">
              <div className="flex items-center gap-2">
                <span className="text-5xl font-black tabular-nums text-white">{partido.golesLocal}</span>
                <span className="text-3xl text-gray-600">–</span>
                <span className="text-5xl font-black tabular-nums text-white">{partido.golesVisitante}</span>
              </div>
              {(partido.fecha || partido.hora) && (
                <p className="mt-1 text-xs text-gray-500">
                  {partido.fecha && new Date(partido.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  {partido.hora && ` · ${partido.hora}`}
                </p>
              )}
              {partido.cancha && (
                <p className="text-xs text-gray-600 truncate max-w-[140px]">{partido.cancha}</p>
              )}
            </div>

            {/* Visitante */}
            <div className="flex flex-1 flex-col items-center gap-2 min-w-0">
              <TeamLogo nombre={partido.equipoVisitante?.nombre ?? "?"} logo={partido.equipoVisitante?.logo ?? null} />
              <p className="text-center text-sm font-semibold text-white leading-tight line-clamp-2">
                {partido.equipoVisitante?.nombre ?? "Por definir"}
              </p>
            </div>
          </div>

          {/* Action bar */}
          {isAdmin && !partido.actaCerrada && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-800 pt-4">
              {canStart && (
                <button
                  onClick={handleIniciar}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-green-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  ▶ Iniciar Partido
                </button>
              )}
              {canClose && (
                <button
                  onClick={() => setConfirmCerrar(true)}
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  ✓ Cerrar Acta
                </button>
              )}
              <button
                onClick={() => { setGolesLEdit(partido.golesLocal); setGolesVEdit(partido.golesVisitante); setShowMarcador(!showMarcador); }}
                disabled={isPending}
                className="rounded-xl border border-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-300 hover:border-gray-500 hover:text-white disabled:opacity-50 transition-colors"
              >
                ✏️ Marcador
              </button>
            </div>
          )}

          {/* Closed acta badge */}
          {partido.actaCerrada && (
            <div className="mt-4 rounded-xl bg-green-900/40 border border-green-800/40 px-4 py-2.5 text-center text-sm font-medium text-green-400">
              ✓ Acta cerrada — resultado oficial
            </div>
          )}

          {/* Marcador manual inline editor */}
          {showMarcador && (
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-gray-800 p-3">
              <input
                type="number" min={0} max={99}
                value={golesLEdit}
                onChange={(e) => setGolesLEdit(Number(e.target.value))}
                className="w-16 rounded-lg border border-gray-600 bg-gray-700 p-2 text-center text-lg font-bold text-white focus:outline-none focus:border-green-500"
              />
              <span className="flex-1 text-center text-gray-500">–</span>
              <input
                type="number" min={0} max={99}
                value={golesVEdit}
                onChange={(e) => setGolesVEdit(Number(e.target.value))}
                className="w-16 rounded-lg border border-gray-600 bg-gray-700 p-2 text-center text-lg font-bold text-white focus:outline-none focus:border-green-500"
              />
              <button
                onClick={handleSaveMarcador}
                disabled={isPending}
                className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
              >
                Guardar
              </button>
              <button
                onClick={() => setShowMarcador(false)}
                className="rounded-lg border border-gray-600 px-3 py-2 text-sm text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* ── Confirm cerrar acta ── */}
        {confirmCerrar && (
          <div className="rounded-2xl border border-amber-700 bg-amber-950/40 p-5 space-y-3">
            <p className="font-semibold text-amber-300">¿Cerrar el acta de este partido?</p>
            <p className="text-sm text-amber-400/80">
              El resultado quedará como oficial y no podrán registrarse más eventos ni modificarse el marcador.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmCerrar(false)}
                className="flex-1 rounded-xl border border-gray-700 py-2.5 text-sm text-gray-300 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCerrarActa}
                disabled={isPending}
                className="flex-1 rounded-xl bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {isPending ? "Cerrando…" : "Confirmar y Cerrar"}
              </button>
            </div>
          </div>
        )}

        {/* ── Players columns ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Local */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <TeamLogo nombre={partido.equipoLocal?.nombre ?? ""} logo={partido.equipoLocal?.logo ?? null} />
              <h3 className="font-semibold text-white truncate">{partido.equipoLocal?.nombre ?? "Local"}</h3>
              <span className="ml-auto text-xs text-gray-500">{partido.equipoLocal?.jugadores.length ?? 0} jug.</span>
            </div>
            {(partido.equipoLocal?.jugadores ?? []).length === 0 ? (
              <p className="px-3 text-sm text-gray-500">Sin jugadores</p>
            ) : (
              partido.equipoLocal!.jugadores.map((j) => (
                <PlayerRow
                  key={j.id}
                  jugador={j}
                  locked={locked}
                  onAction={(tipo) => openEvento(tipo, j, partido.equipoLocal!.id, partido.equipoLocal!.nombre)}
                />
              ))
            )}
          </div>

          {/* Visitante */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 px-1">
              <TeamLogo nombre={partido.equipoVisitante?.nombre ?? ""} logo={partido.equipoVisitante?.logo ?? null} />
              <h3 className="font-semibold text-white truncate">{partido.equipoVisitante?.nombre ?? "Visitante"}</h3>
              <span className="ml-auto text-xs text-gray-500">{partido.equipoVisitante?.jugadores.length ?? 0} jug.</span>
            </div>
            {(partido.equipoVisitante?.jugadores ?? []).length === 0 ? (
              <p className="px-3 text-sm text-gray-500">Sin jugadores</p>
            ) : (
              partido.equipoVisitante!.jugadores.map((j) => (
                <PlayerRow
                  key={j.id}
                  jugador={j}
                  locked={locked}
                  onAction={(tipo) => openEvento(tipo, j, partido.equipoVisitante!.id, partido.equipoVisitante!.nombre)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── Events Timeline ── */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-800">
            <h3 className="font-semibold text-white">Eventos del partido</h3>
            <span className="text-xs text-gray-500">{partido.eventos.length} evento{partido.eventos.length !== 1 ? "s" : ""}</span>
          </div>

          {partido.eventos.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-600">
              Sin eventos registrados aún
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {partido.eventos.map((ev) => (
                <div key={ev.id} className="flex items-start gap-3 px-5 py-3 hover:bg-gray-800/50 transition-colors">
                  <span className="w-10 flex-shrink-0 pt-0.5 text-right text-xs font-bold text-gray-500">
                    {ev.minuto}&apos;
                  </span>
                  <span className="text-lg flex-shrink-0">{EVENTO_ICON[ev.tipo] ?? "•"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">
                      #{ev.jugador.numeroJugador} {ev.jugador.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {ev.equipo.nombre}
                      {ev.asistenciaJugador && ` · Asist: ${ev.asistenciaJugador.nombre}`}
                      {ev.notas && ` · ${ev.notas}`}
                    </p>
                  </div>
                  {!locked && (
                    <button
                      onClick={() => handleDeleteEvento(ev.id)}
                      disabled={isPending}
                      className="flex-shrink-0 rounded-lg p-1.5 text-gray-600 hover:bg-red-900/40 hover:text-red-400 disabled:opacity-50 transition-colors"
                      title="Eliminar evento"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* ── Registro Evento Modal ── */}
      <RegistrarEventoModal
        state={eventoModal}
        todosJugadores={todosJugadores}
        onClose={() => setEventoModal({ open: false })}
        onSubmit={handleSubmitEvento}
        isLoading={isPending}
      />
    </div>
  );
}
