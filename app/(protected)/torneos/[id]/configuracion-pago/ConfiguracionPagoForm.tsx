"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { configuracionPagoSchema, type ConfiguracionPagoInput } from "@/lib/validations";
import type { ConfiguracionPagoRow } from "@/types";

const MONEDAS = ["VES", "USD", "COP", "EUR"] as const;

const BANCOS_VE = [
  "Banesco",
  "Banco de Venezuela",
  "Mercantil",
  "Provincial (BBVA)",
  "Bicentenario",
  "Bancaribe",
  "BOD (Banco Occidental de Descuento)",
  "Exterior",
  "BNC (Banco Nacional de Crédito)",
  "Activo",
  "Sofitasa",
  "Plaza",
  "Fondo Común",
  "100% Banco",
  "Mi Banco",
  "Tesoro",
  "Agrícola de Venezuela",
] as const;

interface Props {
  torneoId:    string;
  initialData: ConfiguracionPagoRow | null;
}

export default function ConfiguracionPagoForm({ torneoId, initialData }: Props) {
  const router = useRouter();

  const pm = initialData?.datosPagoMovil;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ConfiguracionPagoInput>({
    resolver: zodResolver(configuracionPagoSchema),
    defaultValues: {
      montoInscripcion:        initialData?.montoInscripcion ?? undefined,
      moneda:                  (initialData?.moneda as ConfiguracionPagoInput["moneda"]) ?? "VES",
      permiteCuotas:           initialData?.permiteCuotas ?? false,
      numeroCuotas:            initialData?.numeroCuotas ?? undefined,
      montoPrimeraCuota:       initialData?.montoPrimeraCuota ?? undefined,
      montoSegundaCuota:       initialData?.montoSegundaCuota ?? undefined,
      fechaLimitePrimeraCuota: initialData?.fechaLimitePrimeraCuota
        ? new Date(initialData.fechaLimitePrimeraCuota).toISOString().split("T")[0]
        : undefined,
      fechaLimiteSegundaCuota: initialData?.fechaLimiteSegundaCuota
        ? new Date(initialData.fechaLimiteSegundaCuota).toISOString().split("T")[0]
        : undefined,
      banco:         pm?.banco ?? "",
      telefono:      pm?.telefono ?? "",
      cedula:        pm?.cedula ?? "",
      titular:       pm?.titular ?? "",
      instrucciones: initialData?.instrucciones ?? "",
    },
  });

  const permiteCuotas = watch("permiteCuotas");
  const numeroCuotas  = watch("numeroCuotas");

  async function onSubmit(data: ConfiguracionPagoInput) {
    try {
      const res = await fetch(`/api/torneos/${torneoId}/configuracion-pago`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al guardar");
      toast.success("Configuración guardada");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Inscripción */}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Inscripción</h2>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monto de inscripción *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register("montoInscripcion")}
              placeholder="150.00"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
            />
            {errors.montoInscripcion && (
              <p className="mt-1 text-xs text-red-600">{errors.montoInscripcion.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda *</label>
            <select
              {...register("moneda")}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
            >
              {MONEDAS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cuotas */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="permiteCuotas"
            {...register("permiteCuotas")}
            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-400"
          />
          <label htmlFor="permiteCuotas" className="text-sm font-medium text-gray-700">
            Permitir pago en cuotas
          </label>
        </div>

        {permiteCuotas && (
          <div className="space-y-4 pl-7 border-l-2 border-green-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de cuotas
              </label>
              <div className="flex gap-4">
                {[1, 2].map((n) => (
                  <label key={n} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value={n}
                      {...register("numeroCuotas")}
                      className="h-4 w-4 text-green-600 focus:ring-green-400"
                    />
                    <span className="text-sm text-gray-700">{n} cuota{n > 1 ? "s" : ""}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto 1ª cuota
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("montoPrimeraCuota")}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha límite 1ª cuota
                </label>
                <input
                  type="date"
                  {...register("fechaLimitePrimeraCuota")}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
                />
              </div>
            </div>

            {Number(numeroCuotas) === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto 2ª cuota
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("montoSegundaCuota")}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha límite 2ª cuota
                  </label>
                  <input
                    type="date"
                    {...register("fechaLimiteSegundaCuota")}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Datos Pago Móvil */}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Datos de Pago Móvil</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Los equipos verán estos datos para realizar su pago móvil
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco *</label>
            <select
              {...register("banco")}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
            >
              <option value="">Selecciona un banco</option>
              {BANCOS_VE.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            {errors.banco && (
              <p className="mt-1 text-xs text-red-600">{errors.banco.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono *
            </label>
            <input
              {...register("telefono")}
              placeholder="0414-1234567"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
            />
            {errors.telefono && (
              <p className="mt-1 text-xs text-red-600">{errors.telefono.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cédula *
            </label>
            <input
              {...register("cedula")}
              placeholder="V-12345678"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-mono focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
            />
            {errors.cedula && (
              <p className="mt-1 text-xs text-red-600">{errors.cedula.message}</p>
            )}
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Titular *</label>
            <input
              {...register("titular")}
              placeholder="Nombre completo del titular"
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300"
            />
            {errors.titular && (
              <p className="mt-1 text-xs text-red-600">{errors.titular.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Instrucciones */}
      <section className="rounded-2xl bg-white border border-gray-100 shadow-sm p-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Instrucciones adicionales
        </label>
        <textarea
          {...register("instrucciones")}
          rows={4}
          placeholder="Ej: Indicar en el concepto el nombre del equipo y número de cuota."
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-green-400 focus:outline-none focus:ring-1 focus:ring-green-300 resize-none"
        />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Guardando...
            </span>
          ) : (
            initialData ? "Actualizar configuración" : "Guardar configuración"
          )}
        </button>
      </div>
    </form>
  );
}
