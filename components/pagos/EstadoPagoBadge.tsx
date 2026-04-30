const CONFIG = {
  PENDIENTE:  { label: "En revisión", className: "bg-yellow-100 text-yellow-800", icon: "⏳" },
  APROBADO:   { label: "Aprobado",    className: "bg-green-100 text-green-800",   icon: "✓"  },
  RECHAZADO:  { label: "Rechazado",   className: "bg-red-100 text-red-700",       icon: "✕"  },
};

export default function EstadoPagoBadge({
  estado,
}: {
  estado: "PENDIENTE" | "APROBADO" | "RECHAZADO";
}) {
  const cfg = CONFIG[estado];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}
    >
      {cfg.icon} {cfg.label}
    </span>
  );
}
