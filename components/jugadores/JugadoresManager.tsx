"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import JugadorForm from "./JugadorForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { createJugador, updateJugador, deleteJugador } from "@/lib/actions/jugadores";
import type { JugadorRow } from "@/types";
import type { JugadorInput } from "@/lib/validations";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; jugador: JugadorRow };

interface JugadoresManagerProps {
  equipoId:  string;
  jugadores: JugadorRow[];
  canEdit:   boolean;
  bloqueado: boolean;
}

export default function JugadoresManager({
  equipoId,
  jugadores,
  canEdit,
  bloqueado,
}: JugadoresManagerProps) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [isPending, startTransition] = useTransition();

  const closeModal = () => setModal({ open: false });

  const handleCreate = (data: JugadorInput) => {
    startTransition(async () => {
      const r = await createJugador(equipoId, data);
      if ("error" in r) toast.error(r.error);
      else { toast.success("Jugador agregado"); closeModal(); router.refresh(); }
    });
  };

  const handleUpdate = (data: JugadorInput) => {
    if (!modal.open || modal.mode !== "edit") return;
    startTransition(async () => {
      const r = await updateJugador(modal.jugador.id, data);
      if ("error" in r) toast.error(r.error);
      else { toast.success("Jugador actualizado"); closeModal(); router.refresh(); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este jugador?")) return;
    startTransition(async () => {
      const r = await deleteJugador(id);
      if ("error" in r) toast.error(r.error);
      else { toast.success("Jugador eliminado"); router.refresh(); }
    });
  };

  return (
    <>
      {bloqueado && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          ⚠️ Este equipo está <strong>bloqueado</strong> por falta de pago. No se pueden agregar jugadores.
        </div>
      )}

      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {jugadores.length} jugador{jugadores.length !== 1 ? "es" : ""} registrados
        </p>
        {canEdit && !bloqueado && (
          <Button
            onClick={() => setModal({ open: true, mode: "create" })}
            loading={isPending}
          >
            + Agregar Jugador
          </Button>
        )}
      </div>

      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        {jugadores.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">👟</p>
            <p className="font-medium">No hay jugadores en este equipo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  {["#", "Nombre", "⚽", "🅰️", "🟨", "🟥", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jugadores.map((j) => (
                  <tr key={j.id} className={`hover:bg-gray-50 transition-colors ${j.suspendido ? "opacity-50" : ""}`}>
                    <td className="px-4 py-3 font-bold text-gray-700">#{j.numeroJugador}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{j.nombre}</td>
                    <td className="px-4 py-3 text-center">{j.goles}</td>
                    <td className="px-4 py-3 text-center">{j.asistencias}</td>
                    <td className="px-4 py-3 text-center">{j.tarjetasAmarillas}</td>
                    <td className="px-4 py-3 text-center">{j.tarjetasRojas}</td>
                    <td className="px-4 py-3">
                      {j.suspendido ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Suspendido
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                          Activo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {canEdit && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setModal({ open: true, mode: "edit", jugador: j })}
                            disabled={isPending}
                            className="rounded px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 disabled:opacity-40"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(j.id)}
                            disabled={isPending}
                            className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            Eliminar
                          </button>
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

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.open && modal.mode === "edit" ? "Editar Jugador" : "Agregar Jugador"}
      >
        <JugadorForm
          initialData={modal.open && modal.mode === "edit" ? modal.jugador : undefined}
          onSubmit={modal.open && modal.mode === "edit" ? handleUpdate : handleCreate}
          isLoading={isPending}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
