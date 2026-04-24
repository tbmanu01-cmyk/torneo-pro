import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-green-600">
            ⚽ TorneoPro
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Crea tu cuenta</h1>
          <p className="mt-1 text-sm text-gray-500">Empieza a gestionar tus torneos hoy</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-sm border border-gray-100">
          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-green-600 hover:text-green-700">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
