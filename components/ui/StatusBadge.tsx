const CONFIG: Record<string, { label: string; className: string }> = {
  // EstadoTorneo / EstadoJornada / EstadoPartido
  PENDIENTE:           { label: "Pendiente",           className: "bg-yellow-100 text-yellow-800" },
  EN_CURSO:            { label: "En Curso",             className: "bg-green-100 text-green-800"  },
  FINALIZADO:          { label: "Finalizado",           className: "bg-gray-100 text-gray-600"    },
  FINALIZADA:          { label: "Finalizada",           className: "bg-gray-100 text-gray-600"    },
  SUSPENDIDO:          { label: "Suspendido",           className: "bg-red-100 text-red-700"      },
  // EstadoPago
  PARCIAL:             { label: "Primera cuota pagada", className: "bg-orange-100 text-orange-700"},
  PAGADO:              { label: "Pagado",               className: "bg-green-100 text-green-800"  },
  BLOQUEADO:           { label: "Bloqueado",            className: "bg-red-100 text-red-700"      },
  // EstadoComprobante
  APROBADO:            { label: "Aprobado",             className: "bg-green-100 text-green-800"  },
  RECHAZADO:           { label: "Rechazado",            className: "bg-red-100 text-red-700"      },
  // FormatoTorneo
  LIGA:                { label: "Liga",                 className: "bg-blue-100 text-blue-800"    },
  ELIMINACION_DIRECTA: { label: "Eliminación Directa", className: "bg-orange-100 text-orange-800"},
  IDA_VUELTA:          { label: "Ida y Vuelta",         className: "bg-purple-100 text-purple-800"},
};

export default function StatusBadge({ value }: { value: string }) {
  const cfg = CONFIG[value] ?? { label: value, className: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}
