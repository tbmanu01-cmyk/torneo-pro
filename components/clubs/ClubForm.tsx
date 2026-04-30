"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clubSchema, type ClubInput } from "@/lib/validations";
import ImageUpload from "@/components/ui/ImageUpload";
import Button from "@/components/ui/Button";
import type { ClubRow } from "@/types";

interface Props {
  initialData?: ClubRow;
  onSubmit:     (data: ClubInput) => void;
  isLoading:    boolean;
  onCancel:     () => void;
  isSuperAdmin: boolean;
  capitanes?:   { id: string; name: string; email: string }[];
}

export default function ClubForm({
  initialData, onSubmit, isLoading, onCancel, isSuperAdmin, capitanes = [],
}: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<ClubInput>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      nombre:    initialData?.nombre     ?? "",
      logo:      initialData?.logo       ?? "",
      ciudad:    initialData?.ciudad     ?? "",
      capitanId: initialData?.capitanId  ?? "",
    },
  });

  const logoUrl = watch("logo");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ImageUpload
        label="Escudo del club"
        currentUrl={logoUrl}
        folder="clubs"
        onUpload={(url) => setValue("logo", url)}
      />

      <div>
        <label className="label-base">Nombre del club *</label>
        <input
          type="text"
          placeholder="Club Deportivo Norte"
          className="input-base"
          {...register("nombre")}
        />
        {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
      </div>

      <div>
        <label className="label-base">Ciudad</label>
        <input
          type="text"
          placeholder="Bogotá, Medellín..."
          className="input-base"
          {...register("ciudad")}
        />
      </div>

      {isSuperAdmin && capitanes.length > 0 && (
        <div>
          <label className="label-base">Capitán</label>
          <select className="input-base" {...register("capitanId")}>
            <option value="">Sin capitán asignado</option>
            {capitanes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.email}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? "Guardar cambios" : "Crear club"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
