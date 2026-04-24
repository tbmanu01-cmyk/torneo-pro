"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import EquipoCard from "@/components/equipos/EquipoCard";
import EquipoForm from "@/components/equipos/EquipoForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { createEquipo, updateEquipo, deleteEquipo } from "@/lib/actions/equipos";
import type { EquipoRow } from "@/types";
import type { EquipoInput } from "@/lib/validations";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; equipo: EquipoRow };

interface TorneoEquiposProps {
  torneoId:  string;
  equipos:   EquipoRow[];
  isAdmin:   boolean;
}

export default function TorneoEquipos({ torneoId, equipos, isAdmin }: TorneoEquiposProps) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [isPending, startTransition] = useTransition();

  const closeModal = () => setModal({ open: false });

  const handleCreate = (data: EquipoInput) => {
    startTransition(async () => {
      const r = await createEquipo(torneoId, data);
      if ("error" in r) toast.error(r.error);
      else { toast.success("Equipo creado"); closeModal(); router.refresh(); }
    });
  };

  const handleUpdate = (data: EquipoInput) => {
    if (!modal.open || modal.mode !== "edit") return;
    startTransition(async () => {
      const r = await updateEquipo(modal.equipo.id, data);
      if ("error" in r) toast.error(r.error);
      else { toast.success("Equipo actualizado"); closeModal(); router.refresh(); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este equipo y todos sus jugadores?")) return;
    startTransition(async () => {
      const r = await deleteEquipo(id);
      if ("error" in r) toast.error(r.error);
      else { toast.success("Equipo eliminado"); router.refresh(); }
    });
  };

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {equipos.length} equipo{equipos.length !== 1 ? "s" : ""} participando
        </p>
        {isAdmin && (
          <Button
            onClick={() => setModal({ open: true, mode: "create" })}
            loading={isPending}
          >
            + Agregar Equipo
          </Button>
        )}
      </div>

      {equipos.length === 0 ? (
        <div className="py-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">👕</p>
          <p className="font-medium">No hay equipos en este torneo</p>
          {isAdmin && (
            <p className="text-sm mt-1">Haz clic en "Agregar Equipo" para comenzar</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((eq) => (
            <EquipoCard
              key={eq.id}
              equipo={eq}
              isAdmin={isAdmin}
              onEdit={(e) => setModal({ open: true, mode: "edit", equipo: e })}
              onDelete={handleDelete}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.open && modal.mode === "edit" ? "Editar Equipo" : "Agregar Equipo"}
      >
        <EquipoForm
          initialData={modal.open && modal.mode === "edit" ? modal.equipo : undefined}
          onSubmit={modal.open && modal.mode === "edit" ? handleUpdate : handleCreate}
          isLoading={isPending}
          onCancel={closeModal}
          isAdmin={isAdmin}
        />
      </Modal>
    </>
  );
}
