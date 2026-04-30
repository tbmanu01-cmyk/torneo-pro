"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ClubCard from "./ClubCard";
import ClubForm from "./ClubForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { createClub, updateClub, deleteClub } from "@/lib/actions/clubs";
import type { ClubRow } from "@/types";
import type { ClubInput } from "@/lib/validations";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; club: ClubRow };

interface Props {
  clubs:        ClubRow[];
  isSuperAdmin: boolean;
  canCreate:    boolean;
  capitanes:    { id: string; name: string; email: string }[];
}

export default function ClubsManager({ clubs, isSuperAdmin, canCreate, capitanes }: Props) {
  const router = useRouter();
  const [modal, setModal]     = useState<ModalState>({ open: false });
  const [isPending, startTransition] = useTransition();
  const [search, setSearch]   = useState("");

  const closeModal = () => setModal({ open: false });

  const filtered = clubs.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.ciudad ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (c.capitan?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (data: ClubInput) => {
    startTransition(async () => {
      const r = await createClub(data);
      if ("error" in r) toast.error(r.error!);
      else { toast.success("Club creado"); closeModal(); router.refresh(); }
    });
  };

  const handleUpdate = (data: ClubInput) => {
    if (!modal.open || modal.mode !== "edit") return;
    startTransition(async () => {
      const r = await updateClub(modal.club.id, data);
      if ("error" in r) toast.error(r.error!);
      else { toast.success("Club actualizado"); closeModal(); router.refresh(); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Eliminar este club?")) return;
    startTransition(async () => {
      const r = await deleteClub(id);
      if ("error" in r) toast.error(r.error!);
      else { toast.success("Club eliminado"); router.refresh(); }
    });
  };

  return (
    <>
      <div className="mb-5 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <input
          type="text"
          placeholder="Buscar club, ciudad o capitán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />
        {canCreate && (
          <Button onClick={() => setModal({ open: true, mode: "create" })} loading={isPending}>
            + Nuevo Club
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-gray-100">
          <p className="text-4xl mb-3">👕</p>
          <p className="font-medium text-gray-600">
            {search ? "No se encontraron clubs" : "No hay clubs registrados"}
          </p>
          {canCreate && !search && (
            <p className="text-sm text-gray-400 mt-1">
              Crea el primer club con el botón de arriba
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              canEdit={isSuperAdmin || true}
              onEdit={(c) => setModal({ open: true, mode: "edit", club: c })}
              onDelete={handleDelete}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.open && modal.mode === "edit" ? "Editar Club" : "Nuevo Club"}
      >
        <ClubForm
          initialData={modal.open && modal.mode === "edit" ? modal.club : undefined}
          onSubmit={modal.open && modal.mode === "edit" ? handleUpdate : handleCreate}
          isLoading={isPending}
          onCancel={closeModal}
          isSuperAdmin={isSuperAdmin}
          capitanes={capitanes}
        />
      </Modal>
    </>
  );
}
