"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import type { UserRow } from "@/types";
import UserTable from "./UserTable";
import UserForm from "./UserForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import {
  createUser,
  updateUser,
  deleteUser,
} from "@/app/(protected)/admin/users/actions";

type ModalState =
  | { open: false }
  | { open: true; mode: "create" }
  | { open: true; mode: "edit"; user: UserRow };

interface UsersManagerProps {
  initialUsers:  UserRow[];
  currentUserId: string;
}

export default function UsersManager({ initialUsers, currentUserId }: UsersManagerProps) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalState>({ open: false });
  const [isPending, startTransition] = useTransition();

  const closeModal = () => setModal({ open: false });

  const handleCreate = (data: Record<string, string>) => {
    startTransition(async () => {
      const result = await createUser(data as { name: string; email: string; password: string; role: string });
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Usuario creado correctamente");
        closeModal();
        router.refresh();
      }
    });
  };

  const handleUpdate = (data: Record<string, string>) => {
    if (modal.open && modal.mode === "edit") {
      startTransition(async () => {
        const result = await updateUser(modal.user.id, data as { name: string; role: string });
        if ("error" in result) {
          toast.error(result.error);
        } else {
          toast.success("Usuario actualizado correctamente");
          closeModal();
          router.refresh();
        }
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;
    startTransition(async () => {
      const result = await deleteUser(id);
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Usuario eliminado");
        router.refresh();
      }
    });
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">
            {initialUsers.length} usuario{initialUsers.length !== 1 ? "s" : ""} en el sistema
          </p>
        </div>
        <Button
          onClick={() => setModal({ open: true, mode: "create" })}
          loading={isPending}
        >
          + Nuevo Usuario
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <UserTable
          users={initialUsers}
          onEdit={(user) => setModal({ open: true, mode: "edit", user })}
          onDelete={handleDelete}
          currentUserId={currentUserId}
          isPending={isPending}
        />
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.open}
        onClose={closeModal}
        title={modal.open && modal.mode === "edit" ? "Editar Usuario" : "Crear Usuario"}
      >
        <UserForm
          mode={modal.open && modal.mode === "edit" ? "edit" : "create"}
          initialData={
            modal.open && modal.mode === "edit"
              ? { name: modal.user.name, role: modal.user.role }
              : undefined
          }
          onSubmit={modal.open && modal.mode === "edit" ? handleUpdate : handleCreate}
          isLoading={isPending}
          onCancel={closeModal}
        />
      </Modal>
    </>
  );
}
