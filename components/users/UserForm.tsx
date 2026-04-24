"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";

const ROLE_OPTIONS = [
  { value: "SUPER_ADMIN",  label: "Super Admin" },
  { value: "ADMIN_TORNEO", label: "Admin Torneo" },
  { value: "ASISTENTE",    label: "Asistente" },
  { value: "CAPITAN",      label: "Capitán" },
  { value: "ESPECTADOR",   label: "Espectador" },
] as const;

const ROLES = ROLE_OPTIONS.map((r) => r.value) as [string, ...string[]];

const createSchema = z.object({
  name:     z.string().min(2, "Mínimo 2 caracteres"),
  email:    z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  role:     z.enum(ROLES as [string, ...string[]]),
});

const editSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres"),
  role: z.enum(ROLES as [string, ...string[]]),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues   = z.infer<typeof editSchema>;

interface UserFormProps {
  mode:         "create" | "edit";
  initialData?: { name: string; role: string };
  onSubmit:     (data: CreateValues | EditValues) => void;
  isLoading:    boolean;
  onCancel:     () => void;
}

export default function UserForm({
  mode,
  initialData,
  onSubmit,
  isLoading,
  onCancel,
}: UserFormProps) {
  const schema = mode === "create" ? createSchema : editSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateValues | EditValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ?? { role: "ESPECTADOR" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="label-base">Nombre</label>
        <input
          type="text"
          placeholder="Juan Pérez"
          className="input-base"
          {...register("name")}
        />
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      {mode === "create" && (
        <>
          <div>
            <label className="label-base">Email</label>
            <input
              type="email"
              placeholder="usuario@email.com"
              className="input-base"
              {...register("email" as keyof CreateValues)}
            />
            {(errors as Partial<Record<keyof CreateValues, { message?: string }>>).email && (
              <p className="error-message">
                {(errors as Partial<Record<keyof CreateValues, { message?: string }>>).email?.message}
              </p>
            )}
          </div>
          <div>
            <label className="label-base">Contraseña</label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className="input-base"
              {...register("password" as keyof CreateValues)}
            />
            {(errors as Partial<Record<keyof CreateValues, { message?: string }>>).password && (
              <p className="error-message">
                {(errors as Partial<Record<keyof CreateValues, { message?: string }>>).password?.message}
              </p>
            )}
          </div>
        </>
      )}

      <div>
        <label className="label-base">Rol</label>
        <select className="input-base" {...register("role")}>
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.role && <p className="error-message">{errors.role.message}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={isLoading} className="flex-1">
          {mode === "create" ? "Crear Usuario" : "Guardar Cambios"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}
