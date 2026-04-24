"use client";

import RoleBadge from "@/components/ui/RoleBadge";
import type { UserRow } from "@/types";

interface UserTableProps {
  users:         UserRow[];
  onEdit:        (user: UserRow) => void;
  onDelete:      (id: string) => void;
  currentUserId: string;
  isPending:     boolean;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
  currentUserId,
  isPending,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-4xl mb-3">👥</p>
        <p className="font-medium">No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
              Creado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wide text-gray-500">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50/70 transition-colors">
              <td className="px-6 py-4">
                <span className="font-medium text-gray-900">{user.name}</span>
                {user.id === currentUserId && (
                  <span className="ml-2 text-xs text-gray-400">(tú)</span>
                )}
              </td>
              <td className="px-6 py-4 text-gray-500">{user.email}</td>
              <td className="px-6 py-4">
                <RoleBadge role={user.role} />
              </td>
              <td className="px-6 py-4 text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(user)}
                    disabled={isPending}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600
                               hover:bg-blue-50 transition-colors disabled:opacity-40"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => onDelete(user.id)}
                    disabled={isPending || user.id === currentUserId}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600
                               hover:bg-red-50 transition-colors disabled:opacity-40"
                    title={user.id === currentUserId ? "No puedes eliminar tu cuenta" : ""}
                  >
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
