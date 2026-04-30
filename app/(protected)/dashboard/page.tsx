import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import RoleBadge from "@/components/ui/RoleBadge";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

type DashboardCard = {
  title:       string;
  description: string;
  icon:        string;
  href:        string;
  enabled:     boolean;
};

const ROLE_CONFIG: Record<
  Role,
  { welcome: string; cards: DashboardCard[] }
> = {
  SUPER_ADMIN: {
    welcome: "Panel de Super Administrador",
    cards: [
      {
        title:       "Gestionar Usuarios",
        description: "Crea, edita y administra todos los usuarios del sistema",
        icon:        "👥",
        href:        "/admin/users",
        enabled:     true,
      },
      {
        title:       "Ver Torneos",
        description: "Visualiza y supervisa todos los torneos activos",
        icon:        "🏆",
        href:        "/torneos",
        enabled:     true,
      },
      {
        title:       "Configuración",
        description: "Ajustes globales de la plataforma",
        icon:        "⚙️",
        href:        "/admin/settings",
        enabled:     false,
      },
    ],
  },
  ADMIN_TORNEO: {
    welcome: "Panel de Administrador de Torneo",
    cards: [
      {
        title:       "Mis Torneos",
        description: "Gestiona todos tus torneos activos e históricos",
        icon:        "🏆",
        href:        "/torneos",
        enabled:     true,
      },
      {
        title:       "Crear Torneo",
        description: "Crea un nuevo torneo y configura sus parámetros",
        icon:        "➕",
        href:        "/torneos/crear",
        enabled:     true,
      },
      {
        title:       "Equipos",
        description: "Administra los equipos participantes",
        icon:        "👕",
        href:        "/torneos",
        enabled:     true,
      },
    ],
  },
  ASISTENTE: {
    welcome: "Panel de Asistente",
    cards: [
      {
        title:       "Torneos",
        description: "Explora y gestiona los torneos asignados",
        icon:        "🏆",
        href:        "/torneos",
        enabled:     true,
      },
      {
        title:       "Modo Cancha",
        description: "Registra resultados y eventos en tiempo real",
        icon:        "⚽",
        href:        "/matches/live",
        enabled:     false,
      },
    ],
  },
  CAPITAN: {
    welcome: "Panel de Capitán",
    cards: [
      {
        title:       "Torneos",
        description: "Consulta los torneos en los que participas",
        icon:        "🏆",
        href:        "/torneos",
        enabled:     true,
      },
      {
        title:       "Pagos",
        description: "Sube tu comprobante y revisa el estado de pago de tu equipo",
        icon:        "💳",
        href:        "/torneos",
        enabled:     true,
      },
      {
        title:       "Calendario",
        description: "Consulta el fixture y los próximos partidos",
        icon:        "📅",
        href:        "/schedule",
        enabled:     false,
      },
    ],
  },
  ESPECTADOR: {
    welcome: "Explorar TorneoPro",
    cards: [
      {
        title:       "Torneos",
        description: "Explora los torneos disponibles",
        icon:        "🏆",
        href:        "/torneos",
        enabled:     true,
      },
      {
        title:       "Tabla de Posiciones",
        description: "Consulta las clasificaciones actualizadas",
        icon:        "📊",
        href:        "/standings",
        enabled:     false,
      },
    ],
  },
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role as Role;
  const config = ROLE_CONFIG[role] ?? ROLE_CONFIG.ESPECTADOR;

  // Si es capitán, apuntar "Pagos" directo al equipo
  if (role === "CAPITAN") {
    const equipo = await prisma.equipo.findFirst({
      where:   { capitanId: session.user.id },
      orderBy: { createdAt: "desc" },
    });
    if (equipo) {
      const pagosCard = config.cards.find((c) => c.title === "Pagos");
      if (pagosCard) pagosCard.href = `/equipos/${equipo.id}/pagos`;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-gray-900">
              Hola, {session.user.name} 👋
            </h1>
            <RoleBadge role={role} />
          </div>
          <p className="text-sm text-gray-500">{config.welcome}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {config.cards.map((card) =>
            card.enabled ? (
              <Link
                key={card.title}
                href={card.href}
                className="group rounded-2xl bg-white p-6 shadow-sm border border-gray-100
                           hover:border-green-300 hover:shadow-md transition-all"
              >
                <CardContent card={card} />
              </Link>
            ) : (
              <div
                key={card.title}
                className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 opacity-70"
              >
                <CardContent card={card} comingSoon />
              </div>
            )
          )}
        </div>
      </main>
    </div>
  );
}

function CardContent({
  card,
  comingSoon,
}: {
  card: DashboardCard;
  comingSoon?: boolean;
}) {
  return (
    <>
      <div className="mb-3 text-3xl">{card.icon}</div>
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900">{card.title}</h3>
        {comingSoon && (
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            Pronto
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-gray-500">{card.description}</p>
    </>
  );
}
