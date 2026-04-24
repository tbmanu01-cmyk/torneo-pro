"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-gray-100 bg-white px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/dashboard" className="text-lg font-bold text-green-600">
          ⚽ TorneoPro
        </Link>

        <div className="flex items-center gap-4">
          {session?.user && (
            <span className="hidden text-sm text-gray-500 sm:block">
              {session.user.email}
            </span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium
                       text-gray-700 hover:border-red-300 hover:text-red-600 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </header>
  );
}
