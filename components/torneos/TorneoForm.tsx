"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { torneoSchema, type TorneoInput } from "@/lib/validations";
import { createTorneo, updateTorneo } from "@/lib/actions/torneos";
import ImageUpload from "@/components/ui/ImageUpload";
import Button from "@/components/ui/Button";
import type { TorneoRow } from "@/types";

const FORMATOS = [
  { value: "LIGA",                label: "Liga" },
  { value: "ELIMINACION_DIRECTA", label: "Eliminación Directa" },
  { value: "IDA_VUELTA",          label: "Ida y Vuelta" },
] as const;

interface TorneoFormProps {
  initialData?: Partial<TorneoRow>;
  torneoId?:    string;
}

export default function TorneoForm({ initialData, torneoId }: TorneoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = !!torneoId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TorneoInput>({
    resolver: zodResolver(torneoSchema),
    defaultValues: {
      nombre:         initialData?.nombre         ?? "",
      descripcion:    initialData?.descripcion    ?? "",
      logo:           initialData?.logo           ?? "",
      formato:        initialData?.formato        ?? "LIGA",
      puntosVictoria: initialData?.puntosVictoria ?? 3,
      puntosEmpate:   initialData?.puntosEmpate   ?? 1,
      puntosDerrota:  initialData?.puntosDerrota  ?? 0,
      edicion:        initialData?.edicion        ?? 1,
      fechaInicio:    initialData?.fechaInicio
        ? new Date(initialData.fechaInicio).toISOString().split("T")[0]
        : "",
      fechaFin: initialData?.fechaFin
        ? new Date(initialData.fechaFin).toISOString().split("T")[0]
        : "",
    },
  });

  const logoUrl = watch("logo");

  const onSubmit = (data: TorneoInput) => {
    startTransition(async () => {
      const result = isEdit
        ? await updateTorneo(torneoId, data)
        : await createTorneo(data);

      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success(isEdit ? "Torneo actualizado" : "Torneo creado");
        router.push(`/torneos/${result.torneo.id}`);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Imagen */}
      <ImageUpload
        label="Logo del torneo"
        currentUrl={logoUrl}
        folder="torneos"
        onUpload={(url) => setValue("logo", url)}
      />

      {/* Nombre */}
      <div>
        <label className="label-base">Nombre del torneo *</label>
        <input
          type="text"
          placeholder="Liga Barrial Norte 2025"
          className="input-base"
          {...register("nombre")}
        />
        {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
      </div>

      {/* Descripción */}
      <div>
        <label className="label-base">Descripción</label>
        <textarea
          rows={3}
          placeholder="Describe el torneo..."
          className="input-base resize-none"
          {...register("descripcion")}
        />
      </div>

      {/* Formato */}
      <div>
        <label className="label-base">Formato *</label>
        <select className="input-base" {...register("formato")}>
          {FORMATOS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        {errors.formato && <p className="error-message">{errors.formato.message}</p>}
      </div>

      {/* Puntos */}
      <div>
        <p className="label-base mb-2">Configuración de puntos</p>
        <div className="grid grid-cols-3 gap-3">
          {(["puntosVictoria", "puntosEmpate", "puntosDerrota"] as const).map((field) => (
            <div key={field}>
              <label className="text-xs text-gray-500 capitalize">
                {field === "puntosVictoria" ? "Victoria" : field === "puntosEmpate" ? "Empate" : "Derrota"}
              </label>
              <input
                type="number"
                min={0}
                className="input-base mt-0.5"
                {...register(field)}
              />
              {errors[field] && <p className="error-message">{errors[field]?.message}</p>}
            </div>
          ))}
        </div>
      </div>

      {/* Edición y fechas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="label-base">Edición</label>
          <input type="number" min={1} className="input-base" {...register("edicion")} />
        </div>
        <div>
          <label className="label-base">Fecha inicio</label>
          <input type="date" className="input-base" {...register("fechaInicio")} />
        </div>
        <div>
          <label className="label-base">Fecha fin</label>
          <input type="date" className="input-base" {...register("fechaFin")} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isPending} className="flex-1">
          {isEdit ? "Guardar cambios" : "Crear torneo"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
