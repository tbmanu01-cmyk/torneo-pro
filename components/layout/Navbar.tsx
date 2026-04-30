"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname          = usePathname();
  const role              = session?.user?.role;

  const isActive = (href: string) => pathname?.startsWith(href);

  const navLinks = [
    { href: "/torneos", label: "Torneos",  roles: ["SUPER_ADMIN", "ADMIN_TORNEO", "ASISTENTE", "CAPITAN", "ESPECTADOR"] },
    { href: "/clubs",   label: "Clubs",    roles: ["SUPER_ADMIN", "ADMIN_TORNEO", "CAPITAN"] },
    { href: "/admin/users", label: "Usuarios", roles: ["SUPER_ADMIN"] },
  ].filter((l) => role && l.roles.includes(role));

  return (
    <header className="border-b border-gray-100 bg-white px-6 py-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="py-4 text-lg font-bold text-green-700">
            ⚽ TorneoPro
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {session?.user && (
            <span className="hidden text-sm text-gray-500 sm:block">
              {session.user.email}
            </span>
          )}

          {/* Mobile nav */}
          <nav className="md:hidden flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                  isActive(link.href) ? "bg-green-50 text-green-700" : "text-gray-500"
                }`}
              >
                {link.label.split(" ")[0]}
              </Link>
            ))}
          </nav>

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
