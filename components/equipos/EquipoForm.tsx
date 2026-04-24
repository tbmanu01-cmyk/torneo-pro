"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { equipoSchema, type EquipoInput } from "@/lib/validations";
import ImageUpload from "@/components/ui/ImageUpload";
import Button from "@/components/ui/Button";
import type { EquipoRow } from "@/types";

const ESTADOS_PAGO = [
  { value: "PENDIENTE", label: "Pendiente" },
  { value: "PAGADO",    label: "Pagado" },
  { value: "BLOQUEADO", label: "Bloqueado" },
] as const;

interface EquipoFormProps {
  initialData?: EquipoRow;
  onSubmit:     (data: EquipoInput) => void;
  isLoading:    boolean;
  onCancel:     () => void;
  isAdmin:      boolean;
}

export default function EquipoForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel,
  isAdmin,
}: EquipoFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<EquipoInput>({
    resolver: zodResolver(equipoSchema),
    defaultValues: {
      nombre:     initialData?.nombre     ?? "",
      logo:       initialData?.logo       ?? "",
      capitanId:  initialData?.capitanId  ?? "",
      estadoPago: initialData?.estadoPago ?? "PENDIENTE",
    },
  });

  const logoUrl = watch("logo");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <ImageUpload
        label="Escudo del equipo"
        currentUrl={logoUrl}
        folder="equipos"
        onUpload={(url) => setValue("logo", url)}
      />

      <div>
        <label className="label-base">Nombre del equipo *</label>
        <input
          type="text"
          placeholder="Club Deportivo Norte"
          className="input-base"
          {...register("nombre")}
        />
        {errors.nombre && <p className="error-message">{errors.nombre.message}</p>}
      </div>

      {isAdmin && (
        <div>
          <label className="label-base">Estado de pago</label>
          <select className="input-base" {...register("estadoPago")}>
            {ESTADOS_PAGO.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-1">
        <Button type="submit" loading={isLoading} className="flex-1">
          {initialData ? "Guardar cambios" : "Crear equipo"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
}
