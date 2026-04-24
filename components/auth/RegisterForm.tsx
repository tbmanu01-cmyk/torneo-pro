"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { registerSchema, RegisterInput } from "@/lib/validations";
import Button from "@/components/ui/Button";

export default function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterInput) => {
    setServerError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error ?? "Error al crear la cuenta");
      return;
    }

    // Auto-login tras registro
    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="name" className="label-base">
          Nombre completo
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          placeholder="Juan Pérez"
          className="input-base"
          {...register("name")}
        />
        {errors.name && <p className="error-message">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="email" className="label-base">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          className="input-base"
          {...register("email")}
        />
        {errors.email && <p className="error-message">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="label-base">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Mínimo 6 caracteres"
          className="input-base"
          {...register("password")}
        />
        {errors.password && <p className="error-message">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="label-base">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Repite tu contraseña"
          className="input-base"
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="error-message">{errors.confirmPassword.message}</p>
        )}
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <Button type="submit" loading={isSubmitting} className="w-full">
        Crear cuenta
      </Button>
    </form>
  );
}
