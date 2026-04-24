import type { Role } from "@/types";

const ROLE_CONFIG: Record<Role, { label: string; className: string }> = {
  SUPER_ADMIN:  { label: "Super Admin",   className: "bg-purple-100 text-purple-800" },
  ADMIN_TORNEO: { label: "Admin Torneo",  className: "bg-blue-100 text-blue-800" },
  ASISTENTE:    { label: "Asistente",     className: "bg-yellow-100 text-yellow-800" },
  CAPITAN:      { label: "Capitán",       className: "bg-green-100 text-green-800" },
  ESPECTADOR:   { label: "Espectador",    className: "bg-gray-100 text-gray-600" },
};

export default function RoleBadge({ role }: { role: string }) {
  const config = ROLE_CONFIG[role as Role] ?? ROLE_CONFIG.ESPECTADOR;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
