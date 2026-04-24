"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { jugadorSchema, type JugadorInput } from "@/lib/validations";
import Button from "@/components/ui/Button";
import type { JugadorRow } from "@/types";

interface JugadorFormProps {
  initialData?: JugadorRow;
  onSubmit:     (data: JugadorInput) => void;
  isLoading:    boolean;
  onCancel:     () => void;
}

export default function JugadorForm({ initialData, onSubmit, isLoading, onCancel }: JugadorFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<JugadorInput>({
    resolver: zodResolver(jugadorSchema),
    defaultValues: {
      nombre:            initialData?.nombre            ?? "",
      numeroJugador:     initialData?.numeroJugador     ?? 1,
      goles:             initialData?.goles             ?? 0,
      asistencias:       initialData?.asistencias       ?? 0,
      tarjetasAmarillas: initialData?.tarjetasAmarillas ?? 0,
      tarjetasRojas:     initialData?.tarjetasRojas     ?? 0,
      suspendido:        initialData?.suspendido        ?? false,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="label-base">Nombre *</label>
          <input type="text" placeholder="Juan García" className="input-base" {...register("nombre")} />
          {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
        </div>
        <div>
          <label className="label-base">Dorsal *</label>
          <input type="number" min={1} max={99} className="input-base" {...register("numeroJugador")} />
          {errors.numeroJugador && <p className="error-message">{errors.numeroJugador.message}</p>}
        </div>
      </div>

      {initialData && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">Goles</label>
              <input type="number" min={0} className="input-base" {...register("goles")} />
            </div>
            <div>
              <label className="label-base">Asistencias</label>
              <input type="number" min={0} className="input-base" {...register("asistencias")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label-base">T. Amarillas</label>
              <input type="number" min={0} className="input-base" {...register("tarjetasAmarillas")} />
            </div>
            <div>
              <label className="label-base">T. Rojas</label>
              <input type="number" min={0} className="input-base" {...register("tarjetasRojas")} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded" {...register("suspendido")} />
            <span className="text-sm text-gray-700">Suspendido</span>
          </label>
        </>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? "Guardar cambios" : "Agregar jugador"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
