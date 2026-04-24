"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import TorneoCard from "@/components/torneos/TorneoCard";
import type { TorneoRow, EstadoTorneo } from "@/types";

const FILTROS: { value: EstadoTorneo | "TODOS"; label: string }[] = [
  { value: "TODOS",     label: "Todos" },
  { value: "PENDIENTE", label: "Pendientes" },
  { value: "EN_CURSO",  label: "En Curso" },
  { value: "FINALIZADO",label: "Finalizados" },
];

export default function TorneosPage() {
  const { data: session } = useSession();
  const [torneos, setTorneos] = useState<TorneoRow[]>([]);
  const [filtro,  setFiltro]  = useState<EstadoTorneo | "TODOS">("TODOS");
  const [loading, setLoading] = useState(true);

  const isAdmin = session?.user.role === "SUPER_ADMIN" || session?.user.role === "ADMIN_TORNEO";

  useEffect(() => {
    fetch("/api/torneos")
      .then((r) => r.json())
      .then((data) => { setTorneos(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const visibles = filtro === "TODOS"
    ? torneos
    : torneos.filter((t) => t.estado === filtro);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav simple */}
      <header className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/dashboard" className="text-lg font-bold text-green-600">⚽ TorneoPro</Link>
          <nav className="flex items-center gap-4 text-sm">
            <span className="font-medium text-gray-900">Torneos</span>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Torneos</h1>
            <p className="text-sm text-gray-500 mt-1">
              {visibles.length} torneo{visibles.length !== 1 ? "s" : ""} encontrados
            </p>
          </div>
          {isAdmin && (
            <Link
              href="/torneos/crear"
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 transition-colors shadow-sm"
            >
              + Crear Torneo
            </Link>
          )}
        </div>

        {/* Filtros */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                filtro === f.value
                  ? "bg-green-600 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-green-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-lg font-medium">No hay torneos {filtro !== "TODOS" ? "con este estado" : ""}</p>
            {isAdmin && (
              <Link href="/torneos/crear" className="mt-4 inline-block text-green-600 font-medium hover:underline">
                Crea el primero →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {visibles.map((t) => (
              <TorneoCard
                key={t.id}
                torneo={t}
                isAdmin={isAdmin && (session?.user.role === "SUPER_ADMIN" || session?.user.id === t.adminId)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
