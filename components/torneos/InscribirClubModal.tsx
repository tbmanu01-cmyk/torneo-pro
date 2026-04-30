"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { inscribirClubEnTorneo } from "@/lib/actions/clubs";
import type { ClubRow } from "@/types";

interface Props {
  isOpen:         boolean;
  onClose:        () => void;
  torneoId:       string;
  clubs:          ClubRow[];
  clubsInscritos: string[];   // ids de clubs ya inscritos
}

export default function InscribirClubModal({
  isOpen, onClose, torneoId, clubs, clubsInscritos,
}: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch]          = useState("");
  const [selected, setSelected]      = useState<string | null>(null);

  const disponibles = clubs.filter(
    (c) => !clubsInscritos.includes(c.id) &&
      (c.nombre.toLowerCase().includes(search.toLowerCase()) ||
       (c.ciudad ?? "").toLowerCase().includes(search.toLowerCase()))
  );

  const handleInscribir = () => {
    if (!selected) return;
    startTransition(async () => {
      const r = await inscribirClubEnTorneo(torneoId, selected);
      if ("error" in r) {
        toast.error(r.error!);
      } else {
        toast.success("Club inscrito correctamente");
        setSelected(null);
        setSearch("");
        onClose();
        router.refresh();
      }
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inscribir Club" size="md">
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Buscar club..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-green-500 focus:outline-none"
        />

        {disponibles.length === 0 ? (
          <div className="py-10 text-center text-gray-400">
            <p className="text-3xl mb-2">👕</p>
            <p className="text-sm">
              {clubs.length === 0
                ? "No hay clubs registrados. Créalos en la sección Clubs."
                : "Todos los clubs ya están inscritos en este torneo."}
            </p>
          </div>
        ) : (
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {disponibles.map((club) => (
              <button
                key={club.id}
                onClick={() => setSelected(selected === club.id ? null : club.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selected === club.id
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden">
                  {club.logo
                    ? <img src={club.logo} alt={club.nombre} className="h-full w-full object-cover" />
                    : <span className="font-bold text-white">{club.nombre.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{club.nombre}</p>
                  <p className="text-xs text-gray-500">
                    {club.capitan ? `👤 ${club.capitan.name}` : "Sin capitán"}
                    {club.ciudad ? ` · 📍 ${club.ciudad}` : ""}
                  </p>
                </div>
                {selected === club.id && (
                  <span className="flex-shrink-0 text-green-600 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <Button type="button" variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={handleInscribir}
            loading={isPending}
            disabled={!selected}
            className="flex-1"
          >
            Inscribir Club
          </Button>
        </div>
      </div>
    </Modal>
  );
}
